// Каталог на сервере: марки для всех страниц, модели с версиями — по марке. Кэш с тегом "catalog":
// после правки в /admin — updateTag("catalog")
import "server-only";

import { unstable_cache } from "next/cache";
import { and, asc, count, eq, isNotNull, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { CACHE_VERSION } from "@/lib/db/cacheVersion";

import type { User } from "@/features/auth/types";
import type { LogAction } from "@/features/moderation/types";

import type { AdminBrand, AdminModel, Brand, CatalogModel, CatalogResult } from "./types";

const { carBrands, carModels, carVersions } = schema;

const cachedCatalog = <Args extends unknown[], Result>(fn: (...args: Args) => Promise<Result>, key: string) =>
  unstable_cache(fn, ["catalog", CACHE_VERSION, key], { tags: ["catalog"], revalidate: 3600 });

// Порядок как у людей: «2 Series» раньше «10», без учёта регистра
export const catalogOrder = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

// Видимые марки по алфавиту
export const getBrands = cachedCatalog(async (): Promise<Brand[]> => {
  const rows = await db
    .select({ slug: carBrands.slug, name: carBrands.name, popular: carBrands.popular })
    .from(carBrands)
    .where(eq(carBrands.hidden, false));
  return rows.sort((a, b) => catalogOrder.compare(a.name, b.name));
}, "brands");

// Видимые модели марки с версиями
export const getBrandModels = cachedCatalog(async (brand: string): Promise<CatalogModel[]> => {
  const rows = await db
    .select({ model: carModels.name, version: carVersions.name })
    .from(carModels)
    .innerJoin(carBrands, eq(carBrands.id, carModels.brandId))
    .leftJoin(carVersions, eq(carVersions.modelId, carModels.id))
    .where(and(eq(carBrands.slug, brand), eq(carModels.hidden, false)))
    .orderBy(asc(carModels.name));
  const byModel = new Map<string, string[]>();
  for (const { model, version } of rows) {
    const versions = byModel.get(model) ?? [];
    if (version) versions.push(version);
    byModel.set(model, versions);
  }
  return [...byModel]
    .map(([name, versions]) => ({ name, versions: versions.sort(catalogOrder.compare) }))
    .sort((a, b) => catalogOrder.compare(a.name, b.name));
}, "models");

export async function getBrandName(slug: string): Promise<string | undefined> {
  return (await getBrands()).find((b) => b.slug === slug)?.name;
}

/* ---------- Модерация: весь каталог, включая скрытое, и правка ---------- */

const { listings, moderationLog } = schema;

export async function getAdminBrands(): Promise<AdminBrand[]> {
  const rows = await db
    .select({
      slug: carBrands.slug,
      name: carBrands.name,
      popular: carBrands.popular,
      hidden: carBrands.hidden,
      models: sql<number>`(select count(*)::int from ${carModels} where ${carModels.brandId} = ${carBrands.id})`,
      listings: sql<number>`(select count(*)::int from ${listings} join ${carModels} on ${carModels.id} = ${listings.modelId} where ${carModels.brandId} = ${carBrands.id})`,
    })
    .from(carBrands);
  return rows.sort((a, b) => catalogOrder.compare(a.name, b.name));
}

export async function getAdminModels(brand: string): Promise<AdminModel[]> {
  const rows = await db
    .select({
      id: carModels.id,
      name: carModels.name,
      hidden: carModels.hidden,
      listings: sql<number>`(select count(*)::int from ${listings} where ${listings.modelId} = ${carModels.id})`,
      versionId: carVersions.id,
      version: carVersions.name,
    })
    .from(carModels)
    .innerJoin(carBrands, eq(carBrands.id, carModels.brandId))
    .leftJoin(carVersions, eq(carVersions.modelId, carModels.id))
    .where(eq(carBrands.slug, brand));
  // версии в объявлениях этой марки — чтобы предложить добавить в каталог те, которых там нет
  const used = await db
    .select({ modelId: listings.modelId, version: listings.version, n: count() })
    .from(listings)
    .innerJoin(carModels, eq(carModels.id, listings.modelId))
    .innerJoin(carBrands, eq(carBrands.id, carModels.brandId))
    .where(and(eq(carBrands.slug, brand), isNotNull(listings.version)))
    .groupBy(listings.modelId, listings.version);
  const byId = new Map<number, AdminModel>();
  for (const { versionId, version, ...model } of rows) {
    const entry = byId.get(model.id) ?? { ...model, versions: [], unlisted: [] };
    if (versionId && version) entry.versions.push({ id: versionId, name: version });
    byId.set(model.id, entry);
  }
  for (const { modelId, version, n } of used) {
    const model = byId.get(modelId);
    const known = model?.versions.some((v) => v.name.toLowerCase() === version!.toLowerCase());
    if (model && !known) model.unlisted.push({ name: version!, count: n });
  }
  return [...byId.values()]
    .map((m) => ({
      ...m,
      versions: m.versions.sort((a, b) => catalogOrder.compare(a.name, b.name)),
      unlisted: m.unlisted.sort((a, b) => b.count - a.count).slice(0, 10),
    }))
    .sort((a, b) => catalogOrder.compare(a.name, b.name));
}

// «Land Rover» → «land-rover», «Lynk & Co» → «lynk-co»
export const brandSlug = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const isUniqueViolation = (error: unknown) => (error as { cause?: { code?: string } })?.cause?.code === "23505" || (error as { code?: string })?.code === "23505";

// Ошибка «уже есть» — как результат, остальные — дальше
async function unique(write: () => Promise<unknown>): Promise<CatalogResult> {
  try {
    await write();
    return { ok: true };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: "exists" };
    throw error;
  }
}

async function log(actor: User, action: LogAction, path: string) {
  await db.insert(moderationLog).values({ actorId: actor.id, account: `catalog:${path}`, action });
}

export async function addBrand(actor: User, name: string, popular: boolean): Promise<CatalogResult> {
  const slug = brandSlug(name);
  if (!slug) return { ok: false, error: "invalid" };
  const result = await unique(() => db.insert(carBrands).values({ slug, name, popular }));
  if (result.ok) await log(actor, "catalogAdd", name);
  return result;
}

// slug не меняется (адреса и объявления); название, «популярная» и «скрыта» — да
export async function updateBrand(
  actor: User,
  slug: string,
  changes: { name?: string; popular?: boolean; hidden?: boolean }
): Promise<CatalogResult> {
  const result = await unique(() => db.update(carBrands).set(changes).where(eq(carBrands.slug, slug)));
  if (result.ok) await log(actor, "catalogEdit", changes.name ?? slug);
  return result;
}

export async function addModel(actor: User, brand: string, name: string): Promise<CatalogResult> {
  const [row] = await db.select({ id: carBrands.id, name: carBrands.name }).from(carBrands).where(eq(carBrands.slug, brand));
  if (!row) return { ok: false, error: "invalid" };
  const result = await unique(() => db.insert(carModels).values({ brandId: row.id, name }));
  if (result.ok) await log(actor, "catalogAdd", `${row.name} / ${name}`);
  return result;
}

// Объявления ссылаются на модель по id — после переименования показывают новое название
export async function updateModel(actor: User, id: number, changes: { name?: string; hidden?: boolean }): Promise<CatalogResult> {
  const result = await unique(() => db.update(carModels).set(changes).where(eq(carModels.id, id)));
  if (result.ok) await log(actor, "catalogEdit", changes.name ?? `#${id}`);
  return result;
}

// Удалить можно только модель без объявлений; иначе — скрыть
export async function deleteModel(actor: User, id: number): Promise<CatalogResult> {
  const [model] = await db
    .select({ name: carModels.name, brand: carBrands.name })
    .from(carModels)
    .innerJoin(carBrands, eq(carBrands.id, carModels.brandId))
    .where(eq(carModels.id, id));
  if (!model) return { ok: true };
  const [{ n }] = await db.select({ n: count() }).from(listings).where(eq(listings.modelId, id));
  if (n > 0) return { ok: false, error: "inUse" };
  await db.delete(carModels).where(eq(carModels.id, id));
  await log(actor, "catalogDelete", `${model.brand} / ${model.name}`);
  return { ok: true };
}

export async function addVersion(actor: User, modelId: number, name: string): Promise<CatalogResult> {
  const result = await unique(() => db.insert(carVersions).values({ modelId, name }));
  if (result.ok) await log(actor, "catalogAdd", name);
  return result;
}

// У объявлений версия — текст: удаление из каталога их не меняет
export async function deleteVersion(actor: User, id: number): Promise<CatalogResult> {
  const [version] = await db.delete(carVersions).where(eq(carVersions.id, id)).returning();
  if (version) await log(actor, "catalogDelete", version.name);
  return { ok: true };
}
