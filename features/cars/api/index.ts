// Объявления на сервере: единственное место, где код читает объявления из базы. Страницы и sitemap вызывают
// эти функции напрямую, клиентские компоненты — через ../actions и ../hooks.
// Результаты кэшируются (тег "listings"); после изменения объявления — updateTag("listings")
import "server-only";

import { and, count, desc, eq, inArray, isNotNull, ne, or, sql } from "drizzle-orm";

import { getBrandModels } from "@/features/catalog/api";
import { collections } from "@/features/collections/config";
import { db, schema } from "@/lib/db";
import { isListingId } from "@/lib/validate";

import { versionGroup } from "../lib/version";
import type { FilterModel, Listing, ListingStats } from "../types";

import { cached, forPublic, inCollection, newestFirst, ofDealer, published, selectListings, toListing } from "./rows";

export { published, type Params } from "./rows";
export { PAGE_SIZE, countListings, relaxSuggestions, searchListings, type SearchResult } from "./search";

const { listings, carBrands, carModels, carVersions } = schema;

/* ---------- Счётчики: марки, модели, подборки ---------- */

const statsQuery = cached(async (): Promise<ListingStats> => {
  const [models, collectionCounts] = await Promise.all([
    db
      .select({ brand: carBrands.slug, model: carModels.name, count: count() })
      .from(listings)
      .innerJoin(carModels, eq(carModels.id, listings.modelId))
      .innerJoin(carBrands, eq(carBrands.id, carModels.brandId))
      .where(published)
      .groupBy(carBrands.slug, carModels.name),
    Promise.all(
      collections.map(async (c) => {
        const [{ total }] = await db
          .select({ total: count() })
          .from(listings)
          .where(and(published, inCollection(c.slug)));
        return [c.slug, total] as const;
      })
    ),
  ]);

  const stats: ListingStats = { total: 0, byBrand: {}, byModel: {}, byCollection: Object.fromEntries(collectionCounts) };
  for (const { brand, model, count: n } of models) {
    stats.total += n;
    stats.byBrand[brand] = (stats.byBrand[brand] ?? 0) + n;
    (stats.byModel[brand] ??= {})[model] = n;
  }
  return stats;
}, "stats");

// Сколько опубликованных объявлений: всего, по маркам, моделям и подборкам — для главной, фильтров и меню
export async function getListingStats(): Promise<ListingStats> {
  return statsQuery();
}

// Версии марки для списка моделей /cars: модель → группы версий («530», «E 220») с числом объявлений.
// Группа показывается, если она есть в каталоге или у неё хотя бы 2 объявления: опечатки и описания
// одного продавца («Touring 530d», «53d») остаются в его заголовке, но не засоряют фильтр
const MIN_LISTINGS_OUTSIDE_CATALOGUE = 2;
const versionsQuery = cached(async (brand: string) => {
  const [rows, catalogue] = await Promise.all([
    db
      .select({ model: carModels.name, version: listings.version, n: count() })
      .from(listings)
      .innerJoin(carModels, eq(carModels.id, listings.modelId))
      .innerJoin(carBrands, eq(carBrands.id, carModels.brandId))
      .where(and(published, eq(carBrands.slug, brand), isNotNull(listings.version)))
      .groupBy(carModels.name, listings.version),
    db
      .select({ model: carModels.name, version: carVersions.name })
      .from(carVersions)
      .innerJoin(carModels, eq(carModels.id, carVersions.modelId))
      .innerJoin(carBrands, eq(carBrands.id, carModels.brandId))
      .where(eq(carBrands.slug, brand)),
  ]);
  const known = new Set(catalogue.map(({ model, version }) => `${model}|${versionGroup(version)}`));
  const byModel = new Map<string, Map<string, number>>();
  for (const { model, version, n } of rows) {
    const groups = byModel.get(model) ?? new Map<string, number>();
    const group = versionGroup(version!);
    groups.set(group, (groups.get(group) ?? 0) + n);
    byModel.set(model, groups);
  }
  return Object.fromEntries(
    [...byModel].map(([model, groups]) => [
      model,
      [...groups]
        .filter(([group, n]) => known.has(`${model}|${group}`) || n >= MIN_LISTINGS_OUTSIDE_CATALOGUE)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => versionOrder.compare(a.value, b.value)),
    ])
  );
}, "versions");
const versionOrder = new Intl.Collator("en", { numeric: true });

// Модели марки из каталога и под каждой — группы версий из объявлений (список «Modelis» в /cars и на главной)
export async function getFilterModels(brand: string): Promise<FilterModel[]> {
  const [catalog, versions] = await Promise.all([getBrandModels(brand), versionsQuery(brand)]);
  return catalog.map(({ name, versions: catalogVersions }) => ({ name, versions: versions[name] ?? [], catalogVersions }));
}

/* ---------- Отдельные объявления и подборки ---------- */

const allRows = () => selectListings().orderBy(...newestFirst); // только модерация — без кэша
const publishedRows = cached(
  () => selectListings().where(published).orderBy(...newestFirst),
  "published"
);
const latestRows = cached(
  (limit: number, withPhotos: boolean) =>
    selectListings()
      .where(withPhotos ? and(published, sql`cardinality(${listings.images}) > 0`) : published)
      .orderBy(...newestFirst)
      .limit(limit),
  "latest"
);
const rowById = cached(async (id: number) => {
  const [row] = await selectListings().where(eq(listings.id, id)).limit(1);
  return row ?? null;
}, "byId");
const rowsByIds = cached(
  (ids: number[]) => selectListings().where(inArray(listings.id, ids)),
  "byIds"
);
// Страница дилера (видимые покупателям) — из кэша; кабинет и модерация — всегда свежие данные из базы
const publicDealerRows = cached(
  (slug: string) => selectListings().where(and(ofDealer(slug), published)).orderBy(...newestFirst),
  "byDealer"
);
const dealerRows = (slug: string) => selectListings().where(ofDealer(slug)).orderBy(...newestFirst);
const userRows = (userId: string) => selectListings().where(eq(listings.userId, userId)).orderBy(...newestFirst);

const similarRows = cached(
  (id: number, brand: string, bodyType: string, limit: number) => {
    const hasPhotos = sql`cardinality(${listings.images}) > 0`;
    // та же марка — 2 балла, тот же кузов — 1, фото — 1; показываем от 2 баллов
    const score = sql`(case when ${carBrands.slug} = ${brand} then 2 else 0 end)
      + (case when ${listings.bodyType} = ${bodyType} then 1 else 0 end)
      + (case when ${hasPhotos} then 1 else 0 end)`;
    return selectListings()
      .where(
        and(
          published,
          ne(listings.id, id),
          or(eq(carBrands.slug, brand), and(eq(listings.bodyType, bodyType), hasPhotos))
        )
      )
      .orderBy(desc(score), ...newestFirst)
      .limit(limit);
  },
  "similar"
);

export async function getListing(id: string): Promise<Listing | undefined> {
  if (!isListingId(id)) return undefined;
  const row = await rowById(Number(id));
  return row ? forPublic(toListing(row)) : undefined;
}

// В порядке ids; удалённые из базы — пропускаются (избранное, сравнение)
export async function getListingsByIds(ids: string[]): Promise<Listing[]> {
  const numbers = [...new Set(ids.filter(isListingId).map(Number))].sort((a, b) => a - b).slice(0, 200);
  if (numbers.length === 0) return [];
  const byId = new Map((await rowsByIds(numbers)).map((row) => [String(row.id), forPublic(toListing(row))]));
  return ids.map((id) => byId.get(id)).filter((l) => l !== undefined);
}

// Все опубликованные — для sitemap. TODO(scale): после ~50 000 объявлений — sitemap частями
export async function getPublishedListings(): Promise<Listing[]> {
  return (await publishedRows()).map(toListing);
}

// Свежие опубликованные — главная, «похожие», подсказки на пустых страницах
export async function getLatestListings(limit: number, { withPhotos = false } = {}): Promise<Listing[]> {
  return (await latestRows(limit, withPhotos)).map(toListing);
}

// Похожие: сначала та же марка, потом тот же кузов; с фото — в приоритете
export async function getSimilarListings(listing: Listing, limit: number): Promise<Listing[]> {
  return (await similarRows(Number(listing.id), listing.brand, listing.bodyType, limit)).map(toListing);
}

// Все объявления дилера (кабинет) или только видимые покупателям (страница дилера)
export async function getDealerListings(slug: string, { publicOnly = false } = {}): Promise<Listing[]> {
  return (await (publicOnly ? publicDealerRows(slug) : dealerRows(slug))).map(toListing);
}

export async function getUserListings(userId: string): Promise<Listing[]> {
  return (await userRows(userId)).map(toListing);
}

// Все объявления, включая скрытые и на проверке — только для модерации. TODO(admin): постранично и с поиском
export async function getAllListings(): Promise<Listing[]> {
  return (await allRows()).map(toListing);
}
