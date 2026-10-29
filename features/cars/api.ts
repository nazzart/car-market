// Объявления на сервере: SQL-запросы к таблице listings. Единственное место, где код читает объявления из базы;
// страницы и sitemap вызывают эти функции напрямую, клиентские компоненты — через ./actions и ./hooks.
// Результаты кэшируются (тег "listings"); после изменения объявления — revalidateTag("listings")
import "server-only";

import { unstable_cache } from "next/cache";
import { type SQL, and, asc, count, desc, eq, gte, inArray, isNotNull, isNull, lte, ne, or, sql } from "drizzle-orm";

import { EXOTIC_BRANDS, collections } from "@/features/collections/config";
import { db, schema } from "@/lib/db";
import { PLACES, placeMatcher } from "@/lib/places";

import { FILTER_KEYS, postedPeriods } from "./config/filterOptions";
import type { Listing, ListingStats } from "./types";

const { listings } = schema;

export type Params = { get: (key: string) => string | null };

export const PAGE_SIZE = 20;

/* ---------- Строка базы → Listing ---------- */

// Минуты с публикации считаются при каждом чтении, а не хранятся в кэше
type Row = typeof listings.$inferSelect;
type CachedRow = Omit<Row, "postedAt"> & { postedAt: Date | string }; // из кэша дата приходит строкой

function toListing({ id, dealerSlug, postedAt, engine, ...rest }: CachedRow): Listing {
  // необязательные поля без значения — undefined, как в типе Listing
  const fields = Object.fromEntries(Object.entries(rest).filter(([, value]) => value !== null));
  return {
    ...(fields as Omit<Listing, "id" | "dealer" | "engine" | "postedMinutesAgo">),
    id: String(id),
    ...(dealerSlug ? { dealer: dealerSlug } : {}),
    engine,
    postedMinutesAgo: Math.max(0, Math.round((Date.now() - new Date(postedAt).getTime()) / 60_000)),
  };
}

const cached = <Args extends unknown[], Result>(fn: (...args: Args) => Promise<Result>, key: string) =>
  unstable_cache(fn, ["listings", key], { tags: ["listings"], revalidate: 300 });

const published = isNull(listings.review); // новое объявление на проверке не видно покупателям
const newestFirst = [desc(listings.postedAt), desc(listings.id)];

/* ---------- Фильтры поиска → WHERE ---------- */

// Правила подборок на SQL. Должны совпадать с collection.matches в features/collections/config.ts
const collectionWhere: Record<string, SQL | undefined> = {
  retro: lte(listings.year, 1995),
  sport: and(inArray(listings.bodyType, ["coupe", "convertible"]), gte(listings.power, 300)),
  exotic: or(inArray(listings.brand, EXOTIC_BRANDS), gte(listings.price, 100_000)),
  electric: eq(listings.fuel, "electric"),
};

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
    fuel: listings.fuel, transmission: listings.transmission, drive: listings.drive, sellerType: listings.sellerType,
    dealer: listings.dealerSlug, color: listings.color } as const;
  for (const [key, column] of Object.entries(equals)) {
    const value = text(key);
    if (value) conditions.push(eq(column, value));
  }

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
  if (collection) conditions.push(collectionWhere[collection.slug]);

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
    db
      .select()
      .from(listings)
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
          name === key || (key === "brand" && name === "model") || (key === "place" && name === "area")
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

/* ---------- Счётчики: марки, модели, подборки ---------- */

const statsQuery = cached(async (): Promise<ListingStats> => {
  const [models, collectionCounts] = await Promise.all([
    db
      .select({ brand: listings.brand, model: listings.model, count: count() })
      .from(listings)
      .where(published)
      .groupBy(listings.brand, listings.model),
    Promise.all(
      collections.map(async (c) => {
        const [{ total }] = await db
          .select({ total: count() })
          .from(listings)
          .where(and(published, collectionWhere[c.slug]));
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

/* ---------- Отдельные объявления и подборки ---------- */

const allRows = cached(() => db.select().from(listings).orderBy(...newestFirst), "all");
const publishedRows = cached(
  () => db.select().from(listings).where(published).orderBy(...newestFirst),
  "published"
);
const latestRows = cached(
  (limit: number, withPhotos: boolean) =>
    db
      .select()
      .from(listings)
      .where(withPhotos ? and(published, sql`cardinality(${listings.images}) > 0`) : published)
      .orderBy(...newestFirst)
      .limit(limit),
  "latest"
);
const rowById = cached(async (id: number) => {
  const [row] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  return row ?? null;
}, "byId");
const rowsByIds = cached(
  (ids: number[]) => db.select().from(listings).where(inArray(listings.id, ids)),
  "byIds"
);
const dealerRows = cached(
  (slug: string) => db.select().from(listings).where(eq(listings.dealerSlug, slug)).orderBy(...newestFirst),
  "byDealer"
);
const userRows = cached(
  (userId: string) => db.select().from(listings).where(eq(listings.userId, userId)).orderBy(...newestFirst),
  "byUser"
);

const similarRows = cached(
  (id: number, brand: string, bodyType: string, limit: number) => {
    const hasPhotos = sql`cardinality(${listings.images}) > 0`;
    // та же марка — 2 балла, тот же кузов — 1, фото — 1; показываем от 2 баллов
    const score = sql`(case when ${listings.brand} = ${brand} then 2 else 0 end)
      + (case when ${listings.bodyType} = ${bodyType} then 1 else 0 end)
      + (case when ${hasPhotos} then 1 else 0 end)`;
    return db
      .select()
      .from(listings)
      .where(
        and(
          published,
          ne(listings.id, id),
          or(eq(listings.brand, brand), and(eq(listings.bodyType, bodyType), hasPhotos))
        )
      )
      .orderBy(desc(score), ...newestFirst)
      .limit(limit);
  },
  "similar"
);

const validId = (id: string) => /^\d{1,15}$/.test(id);

export async function getListing(id: string): Promise<Listing | undefined> {
  if (!validId(id)) return undefined;
  const row = await rowById(Number(id));
  return row ? toListing(row) : undefined;
}

// В порядке ids; удалённые из базы — пропускаются (избранное, сравнение)
export async function getListingsByIds(ids: string[]): Promise<Listing[]> {
  const numbers = [...new Set(ids.filter(validId).map(Number))].sort((a, b) => a - b).slice(0, 200);
  if (numbers.length === 0) return [];
  const byId = new Map((await rowsByIds(numbers)).map((row) => [String(row.id), toListing(row)]));
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

export async function getDealerListings(slug: string): Promise<Listing[]> {
  return (await dealerRows(slug)).map(toListing);
}

export async function getUserListings(userId: string): Promise<Listing[]> {
  return (await userRows(userId)).map(toListing);
}

// Все объявления, включая скрытые и на проверке — только для модерации. TODO(admin): постранично и с поиском
export async function getAllListings(): Promise<Listing[]> {
  return (await allRows()).map(toListing);
}
