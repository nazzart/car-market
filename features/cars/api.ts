// Объявления на сервере: SQL-запросы к таблице listings. Единственное место, где код читает объявления из базы;
// страницы и sitemap вызывают эти функции напрямую, клиентские компоненты — через ./actions и ./hooks.
// Результаты кэшируются (тег "listings"); после изменения объявления — revalidateTag("listings")
import "server-only";

import { unstable_cache } from "next/cache";
import { type SQL, and, asc, count, desc, eq, getTableColumns, gte, inArray, isNotNull, isNull, lte, ne, or, sql } from "drizzle-orm";

import { EXOTIC_BRANDS, collections } from "@/features/collections/config";
import { db, schema } from "@/lib/db";
import { CACHE_VERSION } from "@/lib/db/cacheVersion";
import { PLACES, placeMatcher } from "@/lib/places";
import { isListingId } from "@/lib/validate";

import { FILTER_KEYS, postedPeriods } from "./config/filterOptions";
import type { BlockReason } from "@/features/moderation/types";

import type { Listing, ListingStats } from "./types";

const { listings, dealers, dealerContacts, profiles } = schema;

export type Params = { get: (key: string) => string | null };

export const PAGE_SIZE = 20;

/* ---------- Строка базы → Listing ---------- */

// Объявление вместе с продавцом. У дилерского имя и телефон не хранятся в listings, а берутся при чтении:
// имя — из dealers, телефон — контактного лица (dealer_contacts) или основной телефон дилера
// и блокировка аккаунта продавца модератором — из dealers или profiles
const listingColumns = {
  ...getTableColumns(listings),
  dealerSlug: dealers.slug,
  dealerName: dealers.name,
  dealerPhone: dealers.phone,
  contactPhone: dealerContacts.phone,
  blockedReason: sql<BlockReason | null>`coalesce(${dealers.blockedReason}, ${profiles.blockedReason})`,
  blockedNote: sql<string | null>`coalesce(${dealers.blockedNote}, ${profiles.blockedNote})`,
  blockedAt: sql<string | null>`coalesce(${dealers.blockedAt}, ${profiles.blockedAt})`,
};

const selectListings = () =>
  db
    .select(listingColumns)
    .from(listings)
    .leftJoin(dealers, eq(dealers.id, listings.dealerId))
    .leftJoin(dealerContacts, eq(dealerContacts.id, listings.contactId))
    .leftJoin(profiles, eq(profiles.id, listings.userId));

// Минуты с публикации считаются при каждом чтении, а не хранятся в кэше
type Row = Awaited<ReturnType<typeof selectListings>>[number];
type CachedRow = Omit<Row, "postedAt"> & { postedAt: Date | string }; // из кэша дата приходит строкой

const time = (value: Date | string | null) => (value === null ? 0 : new Date(value).getTime());

function toListing({
  id,
  dealerId,
  dealerSlug,
  dealerName,
  dealerPhone,
  contactPhone,
  sellerName,
  phone,
  postedAt,
  engine,
  moderationStatus,
  moderationReason,
  moderationNote,
  moderatedAt,
  blockedReason,
  blockedNote,
  blockedAt,
  excludedCollections,
  ...rest
}: CachedRow): Listing {
  // необязательные поля без значения — undefined, как в типе Listing
  const fields = Object.fromEntries(Object.entries(rest).filter(([, value]) => value !== null));
  const name = dealerName ?? sellerName;
  return {
    ...(fields as unknown as Omit<Listing, "id" | "dealer" | "engine" | "postedMinutesAgo" | "sellerType" | "phone">),
    id: String(id),
    sellerType: dealerId === null ? "private" : "dealer",
    ...(dealerSlug ? { dealer: dealerSlug } : {}),
    ...(name ? { sellerName: name } : {}),
    phone: contactPhone ?? dealerPhone ?? phone ?? "",
    engine,
    postedMinutesAgo: Math.max(0, Math.round((Date.now() - time(postedAt)) / 60_000)),
    ...(moderationStatus && moderationReason
      ? { moderation: { status: moderationStatus, reason: moderationReason, note: moderationNote ?? undefined, at: time(moderatedAt) } }
      : {}),
    ...(blockedReason ? { accountBlock: { reason: blockedReason, note: blockedNote ?? undefined, at: time(blockedAt) } } : {}),
    ...(excludedCollections?.length ? { excludedCollections } : {}),
  };
}

// Объявления дилера по slug из URL — через вложенный запрос, без JOIN в подсчётах
const ofDealer = (slug: string) =>
  inArray(listings.dealerId, db.select({ id: dealers.id }).from(dealers).where(eq(dealers.slug, slug)));

// Тег "dealers" тоже: объявления читают имя и телефон дилера (JOIN), изменение дилера должно обновить и их
const cached = <Args extends unknown[], Result>(fn: (...args: Args) => Promise<Result>, key: string) =>
  unstable_cache(fn, ["listings", CACHE_VERSION, key], { tags: ["listings", "dealers"], revalidate: 300 });


// Видно покупателям: не на проверке, продавец не скрыл/не продал, модератор не заблокировал,
// аккаунт продавца не заблокирован. Должно совпадать с isPublic() в features/moderation/visibility.ts.
// Счётчик «машин в наличии» у дилера (features/dealers/api) считается по нему же
export const published = and(
  isNull(listings.review),
  eq(listings.status, "active"),
  isNull(listings.moderationStatus),
  sql`not exists (select 1 from ${dealers} where ${dealers.id} = ${listings.dealerId} and ${dealers.blockedAt} is not null)`,
  sql`not exists (select 1 from ${profiles} where ${profiles.id} = ${listings.userId} and ${profiles.blockedAt} is not null)`
)!;

// Подборка — по её правилу, кроме объявлений, которые модератор из неё убрал
const inCollection = (slug: string) =>
  and(collectionWhere[slug], sql`not (${slug} = any(${listings.excludedCollections}))`);
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
    fuel: listings.fuel, transmission: listings.transmission, drive: listings.drive, color: listings.color } as const;
  for (const [key, column] of Object.entries(equals)) {
    const value = text(key);
    if (value) conditions.push(eq(column, value));
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
    const score = sql`(case when ${listings.brand} = ${brand} then 2 else 0 end)
      + (case when ${listings.bodyType} = ${bodyType} then 1 else 0 end)
      + (case when ${hasPhotos} then 1 else 0 end)`;
    return selectListings()
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


export async function getListing(id: string): Promise<Listing | undefined> {
  if (!isListingId(id)) return undefined;
  const row = await rowById(Number(id));
  return row ? toListing(row) : undefined;
}

// В порядке ids; удалённые из базы — пропускаются (избранное, сравнение)
export async function getListingsByIds(ids: string[]): Promise<Listing[]> {
  const numbers = [...new Set(ids.filter(isListingId).map(Number))].sort((a, b) => a - b).slice(0, 200);
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
