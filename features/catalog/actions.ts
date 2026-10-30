"use server";

// Server Actions каталога. loadBrandModels — для всех (фильтры, быстрый поиск, форма подачи);
// остальное — только модератору (requireAdmin). После правки — updateTag("catalog"): списки обновляются сразу
import { updateTag } from "next/cache";

import { requireAdmin } from "@/features/auth/api";

import * as catalog from "./api";
import type { AdminBrand, AdminModel, CatalogModel, CatalogResult } from "./types";

const isSlug = (value: unknown): value is string => typeof value === "string" && /^[a-z0-9-]{1,40}$/.test(value);
const isId = (value: unknown): value is number => Number.isInteger(value) && (value as number) > 0;
// название: без лишних пробелов, 1–40 знаков
const nameOf = (value: unknown) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "");
const validName = (name: string) => name.length > 0 && name.length <= 40;
const invalid: CatalogResult = { ok: false, error: "invalid" };

// результат правки → обновить кэш каталога (и объявлений, если правка их касается)
const done = (result: CatalogResult, { listings = false } = {}) => {
  if (result.ok) {
    updateTag("catalog");
    if (listings) updateTag("listings");
  }
  return result;
};

export async function loadBrandModels(brand: string): Promise<CatalogModel[]> {
  return isSlug(brand) ? catalog.getBrandModels(brand) : [];
}

/* ---------- Модерация ---------- */

export async function loadAdminBrands(): Promise<AdminBrand[]> {
  await requireAdmin();
  return catalog.getAdminBrands();
}

export async function loadAdminModels(brand: string): Promise<AdminModel[]> {
  await requireAdmin();
  return isSlug(brand) ? catalog.getAdminModels(brand) : [];
}

export async function addBrand(name: string, popular: boolean): Promise<CatalogResult> {
  const actor = await requireAdmin();
  const clean = nameOf(name);
  return validName(clean) ? done(await catalog.addBrand(actor, clean, Boolean(popular))) : invalid;
}

export async function updateBrand(slug: string, changes: { name?: string; popular?: boolean; hidden?: boolean }): Promise<CatalogResult> {
  const actor = await requireAdmin();
  if (!isSlug(slug)) return invalid;
  const safe: { name?: string; popular?: boolean; hidden?: boolean } = {};
  if (changes?.name !== undefined) {
    const clean = nameOf(changes.name);
    if (!validName(clean)) return invalid;
    safe.name = clean;
  }
  if (typeof changes?.popular === "boolean") safe.popular = changes.popular;
  if (typeof changes?.hidden === "boolean") safe.hidden = changes.hidden;
  // название марки показывается в объявлениях — их кэш тоже
  return done(await catalog.updateBrand(actor, slug, safe), { listings: safe.name !== undefined });
}

export async function addModel(brand: string, name: string): Promise<CatalogResult> {
  const actor = await requireAdmin();
  const clean = nameOf(name);
  return isSlug(brand) && validName(clean) ? done(await catalog.addModel(actor, brand, clean)) : invalid;
}

export async function updateModel(id: number, changes: { name?: string; hidden?: boolean }): Promise<CatalogResult> {
  const actor = await requireAdmin();
  if (!isId(id)) return invalid;
  const safe: { name?: string; hidden?: boolean } = {};
  if (changes?.name !== undefined) {
    const clean = nameOf(changes.name);
    if (!validName(clean)) return invalid;
    safe.name = clean;
  }
  if (typeof changes?.hidden === "boolean") safe.hidden = changes.hidden;
  // название модели показывается в объявлениях — их кэш тоже
  return done(await catalog.updateModel(actor, id, safe), { listings: safe.name !== undefined });
}

export async function deleteModel(id: number): Promise<CatalogResult> {
  const actor = await requireAdmin();
  return isId(id) ? done(await catalog.deleteModel(actor, id)) : invalid;
}

export async function addVersion(modelId: number, name: string): Promise<CatalogResult> {
  const actor = await requireAdmin();
  const clean = nameOf(name);
  return isId(modelId) && validName(clean) ? done(await catalog.addVersion(actor, modelId, clean)) : invalid;
}

export async function deleteVersion(id: number): Promise<CatalogResult> {
  const actor = await requireAdmin();
  return isId(id) ? done(await catalog.deleteVersion(actor, id)) : invalid;
}
