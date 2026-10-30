// Поиск /cars на сервере: фильтры из URL → WHERE, сортировка, страница результатов, счётчики
// и подсказки «уберите фильтр». Те же правила видимости, что везде (published в ./rows.ts)
import "server-only";

import { type SQL, and, asc, count, desc, eq, gte, inArray, isNotNull, isNull, lte, ne, or, sql } from "drizzle-orm";

import { collections } from "@/features/collections/config";
import { db, schema } from "@/lib/db";
import { PLACES, placeMatcher } from "@/lib/places";

import { FILTER_KEYS, postedPeriods } from "../config/filterOptions";
import { versionGroupPattern } from "../lib/version";
import type { Listing } from "../types";
import { type Params, cached, newestFirst, ofDealer, published, selectListings, toListing, inCollection } from "./rows";

const { listings } = schema;

export const PAGE_SIZE = 20;

// Те же фильтры, что в URL /cars (FILTER_KEYS). Неизвестные или кривые значения игнорируются
function searchWhere(params: Params): SQL | undefined {
  const text = (key: string) => params.get(key) || null;
  const num = (key: string) => {
    const value = Number(params.get(key));
    return params.get(key) && Number.isFinite(value) ? value : null;
  };
  const flag = (key: string) => params.get(key) === "1";
  const conditions: (SQL | undefined)[] = [published];

  const equals = { condition: listings.condition, brand: listings.brand, model: listings.model, bodyType: listings.bodyType,
    fuel: listings.fuel, transmission: listings.transmission, drive: listings.drive, color: listings.color } as const;
  for (const [key, column] of Object.entries(equals)) {
    const value = text(key);
    if (value) conditions.push(eq(column, value));
  }

  // версия: группа «530» — 530d, 530e xDrive… (versionGroupPattern); можно и без модели: ?brand=bmw&version=530
  const versions = text("version")?.split(",").filter((v) => v.trim()) ?? [];
  if (versions.length) {
    conditions.push(or(...versions.map((v) => sql`lower(${listings.version}) ~ ${versionGroupPattern(v)}`)));
  }

  const sellerType = text("sellerType");
  if (sellerType === "dealer") conditions.push(isNotNull(listings.dealerId));
  if (sellerType === "private") conditions.push(isNull(listings.dealerId));
  const dealer = text("dealer");
  if (dealer) conditions.push(ofDealer(dealer));

  const ranges = [
    ["priceFrom", gte, listings.price], ["priceTo", lte, listings.price],
    ["yearFrom", gte, listings.year], ["yearTo", lte, listings.year],
    ["mileageTo", lte, listings.mileage],
    ["powerFrom", gte, listings.power], ["powerTo", lte, listings.power],
  ] as const;
  for (const [key, op, column] of ranges) {
    const value = num(key);
    if (value !== null) conditions.push(op(column, value));
  }

  const collection = collections.find((c) => c.slug === text("collection"));
  if (collection) conditions.push(inCollection(collection.slug));

  // место: город или край (край — со своими городами), area — плюс окрестности в км
  const place = text("place");
  if (place) {
    const inPlace = placeMatcher(place, num("area") ?? 0);
    const keys = PLACES.map((p) => p.key).filter(inPlace);
    conditions.push(inArray(listings.city, keys.length ? keys : [place]));
  }

  const posted = postedPeriods[text("posted") as keyof typeof postedPeriods];
  if (posted) conditions.push(gte(listings.postedAt, new Date(Date.now() - posted * 60_000)));

  if (flag("withPhotos")) conditions.push(sql`cardinality(${listings.images}) > 0`);
  if (flag("noAccidents")) conditions.push(eq(listings.noAccidents, true));
  if (flag("oneOwner")) conditions.push(eq(listings.owners, 1));
  if (flag("serviceBook")) conditions.push(eq(listings.serviceBook, true));
  if (flag("recentService")) conditions.push(eq(listings.service, "recent"));
  if (flag("goodCondition")) conditions.push(inArray(listings.overallCondition, ["excellent", "good"]));
  if (flag("inspectionValid")) {
    // техосмотр «MM.YYYY» действует, если не раньше текущего месяца
    const now = new Date();
    const thisMonth = now.getFullYear() * 100 + now.getMonth() + 1;
    conditions.push(
      sql`${listings.inspectionUntil} ~ '^\\d{2}\\.\\d{4}$' and split_part(${listings.inspectionUntil}, '.', 2)::int * 100 + split_part(${listings.inspectionUntil}, '.', 1)::int >= ${thisMonth}`
    );
  }

  const latvia = text("latvia");
  if (latvia === "imported") conditions.push(eq(listings.mileageLatvia, "none"));
  if (latvia === "local") conditions.push(and(isNotNull(listings.mileageLatvia), ne(listings.mileageLatvia, "none")));

  return and(...conditions);
}

const searchOrder = (sort: string | null) => {
  switch (sort) {
    case "price_asc":
      return [asc(listings.price), desc(listings.id)];
    case "price_desc":
      return [desc(listings.price), desc(listings.id)];
    case "mileage_asc":
      return [asc(listings.mileage), desc(listings.id)];
    case "year_desc":
      return [desc(listings.year), desc(listings.id)];
    default:
      return newestFirst;
  }
};

// Ключ кэша — только фильтры и сортировка, в стабильном порядке
const paramsKey = (params: Params) =>
  JSON.stringify([...FILTER_KEYS, "sort"].map((key) => params.get(key) ?? ""));
const paramsFromKey = (key: string): Params => {
  const values = JSON.parse(key) as string[];
  const keys = [...FILTER_KEYS, "sort"];
  return { get: (name) => values[keys.indexOf(name as (typeof keys)[number])] || null };
};

/* ---------- Поиск /cars: страница результатов ---------- */

export type SearchResult = { items: Listing[]; total: number; page: number; pageCount: number };

const searchPage = cached(async (key: string, page: number) => {
  const params = paramsFromKey(key);
  const where = searchWhere(params);
  const [rows, [{ total }]] = await Promise.all([
    selectListings()
      .where(where)
      .orderBy(...searchOrder(params.get("sort")))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(listings).where(where),
  ]);
  return { rows, total };
}, "search");

export async function searchListings(params: Params): Promise<SearchResult> {
  const requested = Math.max(1, Math.floor(Number(params.get("page")) || 1));
  const key = paramsKey(params);
  let { rows, total } = await searchPage(key, requested);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // страница за пределами результатов (?page=99) — показываем последнюю
  const page = Math.min(requested, pageCount);
  if (page !== requested) ({ rows, total } = await searchPage(key, page));
  return { items: rows.map(toListing), total, page, pageCount };
}

const countFor = cached(async (key: string) => {
  const [{ total }] = await db.select({ total: count() }).from(listings).where(searchWhere(paramsFromKey(key)));
  return total;
}, "count");

export async function countListings(params: Params): Promise<number> {
  return countFor(paramsKey(params));
}

// Ничего не нашлось: сколько будет, если убрать один из фильтров (до 4 лучших подсказок)
export async function relaxSuggestions(params: Params): Promise<{ key: string; count: number }[]> {
  const active = FILTER_KEYS.filter((key) => key !== "area" && params.get(key));
  const counted = await Promise.all(
    active.map(async (key) => {
      const without: Params = {
        get: (name) =>
          name === key ||
          (key === "brand" && (name === "model" || name === "version")) ||
          (key === "model" && name === "version") ||
          (key === "place" && name === "area")
            ? null
            : params.get(name),
      };
      return { key, count: await countListings(without) };
    })
  );
  return counted
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
}
