// Дилеры на сервере: SQL-запросы к таблицам dealers и dealer_contacts. Страницы и sitemap вызывают эти функции,
// клиентские компоненты — хуки из ./hooks. Кэш с тегом "dealers"; после изменения — revalidateTag("dealers")
import "server-only";

import { unstable_cache } from "next/cache";
import { type SQL, and, asc, count, desc, eq, getTableColumns, ilike, inArray, isNotNull, isNull, ne, or, sql } from "drizzle-orm";

import { published } from "@/features/cars/api";

import { db, schema } from "@/lib/db";
import { CACHE_VERSION } from "@/lib/db/cacheVersion";
import { PLACES, findPlace, placeMatcher } from "@/lib/places";

import { isListed } from "./lib/listed";
import { getOpenStatus } from "./lib/openStatus";
import type { Dealer, DealerContact, DealerFilterOptions, DealerPin } from "./types";

const { dealers, dealerContacts, listings, dealerBrands, carBrands } = schema;

// Марки дилера — подзапрос через query builder: в запросе с JOIN Drizzle пишет столбцы с именем таблицы.
// В sql`…` к одной таблице он пишет их без имени, и «"dealer_id" = "id"» сравнивал бы с car_brands.id
const brandsOf = (dealerId: typeof dealers.id) =>
  db
    .select({ slug: carBrands.slug })
    .from(dealerBrands)
    .innerJoin(carBrands, eq(carBrands.id, dealerBrands.brandId))
    .where(eq(dealerBrands.dealerId, dealerId));

// Дилер с марками официального дилера (slug из каталога, по алфавиту)
const dealerColumns = {
  ...getTableColumns(dealers),
  brands: sql<string[]>`array(${brandsOf(dealers.id).orderBy(carBrands.name)})`,
};
type Row = typeof dealers.$inferSelect & { brands: string[] };

// «Машин в наличии» — опубликованные объявления дилера, по тому же правилу, что и /cars
async function stockCounts(): Promise<Map<number, number>> {
  const rows = await db
    .select({ dealerId: listings.dealerId, n: count() })
    .from(listings)
    .where(and(isNotNull(listings.dealerId), published))
    .groupBy(listings.dealerId);
  return new Map(rows.map((r) => [r.dealerId!, r.n]));
}

// внутренний номер, даты и поля блокировки наружу как есть не отдаём: дилер известен по slug, блокировка — объектом
const HIDDEN = new Set(["id", "createdAt", "blockedReason", "blockedNote", "blockedAt"]);

const toContact = ({ id, name, phone, role }: typeof dealerContacts.$inferSelect): DealerContact => ({
  id,
  name,
  phone,
  ...(role ? { role } : {}),
});

function toDealer(row: Row, contacts: DealerContact[], carsInStock: number): Dealer {
  // необязательные поля без значения — undefined, как в типе Dealer
  const fields = Object.fromEntries(Object.entries(row).filter(([key, value]) => value !== null && !HIDDEN.has(key)));
  const { blockedReason, blockedNote, blockedAt } = row;
  return {
    ...(fields as Omit<Dealer, "contacts" | "blocked" | "carsInStock">),
    carsInStock,
    ...(contacts.length ? { contacts } : {}),
    // из кэша дата приходит строкой
    ...(blockedReason && blockedAt
      ? { blocked: { reason: blockedReason, note: blockedNote ?? undefined, at: new Date(blockedAt).getTime() } }
      : {}),
  };
}

// Дилеров немного (сотни), поэтому каталог читается целиком двумя запросами и кэшируется
const catalog = unstable_cache(
  async () => {
    const [rows, contacts, stock] = await Promise.all([
      db.select(dealerColumns).from(dealers).orderBy(asc(dealers.name)),
      db.select().from(dealerContacts).orderBy(asc(dealerContacts.dealerId), asc(dealerContacts.position)),
      stockCounts(),
    ]);
    return rows.map((row) =>
      toDealer(row, contacts.filter((c) => c.dealerId === row.id).map(toContact), stock.get(row.id) ?? 0)
    );
  },
  ["dealers", CACHE_VERSION, "catalog"],
  // "listings" — число машин меняется вместе с объявлениями
  { tags: ["dealers", "listings"], revalidate: 300 }
);

export async function getDealer(slug: string): Promise<Dealer | undefined> {
  return (await catalog()).find((d) => d.slug === slug);
}

// Своя страница дилера для кабинета и настроек — мимо кэша: только что зарегистрированный дилер
// или правка из базы видны сразу
export async function getDealerUncached(slug: string): Promise<Dealer | undefined> {
  const [row] = await db.select(dealerColumns).from(dealers).where(eq(dealers.slug, slug));
  if (!row) return undefined;
  const [contacts, [stock]] = await Promise.all([
    db.select().from(dealerContacts).where(eq(dealerContacts.dealerId, row.id)).orderBy(asc(dealerContacts.position)),
    db.select({ n: count() }).from(listings).where(and(eq(listings.dealerId, row.id), published)),
  ]);
  return toDealer(row, contacts.map(toContact), stock?.n ?? 0);
}

// Весь каталог, включая заблокированных, с заметками модератора — только для модерации (requireAdmin)
export async function getDealers(): Promise<Dealer[]> {
  return catalog();
}


// Дилеры, видимые покупателям: с заполненным профилем и не заблокированные (lib/listed.ts)
export async function getPublicDealers(): Promise<Dealer[]> {
  return (await catalog()).filter(isListed);
}

// Всего дилеров — для подзаголовка «14 uzņēmumi visā Latvijā»
export async function countDealers(): Promise<number> {
  return (await getPublicDealers()).length;
}

/* ---------- Страница /dealers: фильтры, карта, постраничный список ---------- */

export const DEALERS_PAGE_SIZE = 10;

type Params = { get: (key: string) => string | null };

// Варианты фильтров — только по дилерам, которых видят покупатели, с числом дилеров у каждого:
// города, края (novadi) с городами, где есть дилеры («Ogres novads» — дилеры в Ogre, Ikšķile…), и марки официальных дилеров
export async function getDealerFilterOptions(): Promise<DealerFilterOptions> {
  const listed = await getPublicDealers();
  const tally = (keys: string[]) =>
    [...keys.reduce((m, key) => m.set(key, (m.get(key) ?? 0) + 1), new Map<string, number>())].map(([value, count]) => ({ value, count }));

  const municipality = (key: string) => findPlace(key)?.kind === "municipality";
  const areas = PLACES.filter((p) => p.kind === "municipality")
    .map((p) => {
      const inside = placeMatcher(p.key);
      return { value: p.key, count: listed.filter((d) => inside(d.city)).length };
    })
    .filter((a) => a.count > 0);

  return {
    cities: tally(listed.map((d) => d.city).filter((city) => !municipality(city))),
    areas,
    brands: tally(listed.flatMap((d) => d.brands)),
  };
}

// Город — только он; край — все его города (как фильтр «Vieta» в /cars)
const placeKeys = (selected: string) => {
  const keys = PLACES.map((p) => p.key).filter(placeMatcher(selected));
  return keys.length ? keys : [selected];
};

// Поиск по названию или адресу: «%» и «_» из ввода — обычные символы, а не шаблон
const likeText = (text: string) => `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

// Фильтры из URL → SQL. Результат кэшируется: «открыто сейчас» и область карты считаются после, на каждый запрос
const matchingRows = unstable_cache(
  async (q: string, type: string, city: string, brand: string) => {
    // как isListed() в lib/listed.ts: профиль заполнен (адрес, телефон), модератор не заблокировал
    const conditions: (SQL | undefined)[] = [isNull(dealers.blockedAt), ne(dealers.address, ""), ne(dealers.phone, "")];
    if (q) conditions.push(or(ilike(dealers.name, likeText(q)), ilike(dealers.address, likeText(q))));
    if (type) conditions.push(eq(dealers.type, type as Dealer["type"]));
    if (city) conditions.push(inArray(dealers.city, placeKeys(city)));
    if (brand)
      conditions.push(sql`${brand} in (${brandsOf(dealers.id)})`);
    // проверенные — выше, дальше по алфавиту
    const [rows, stock] = await Promise.all([
      db
        .select(dealerColumns)
        .from(dealers)
        .where(and(...conditions))
        .orderBy(desc(dealers.verified), asc(dealers.name)),
      stockCounts(),
    ]);
    return rows.map((row) => toDealer(row, [], stock.get(row.id) ?? 0));
  },
  ["dealers", CACHE_VERSION, "search"],
  { tags: ["dealers", "listings"], revalidate: 300 }
);

// «south,west,north,east» из URL (поиск при перемещении карты)
function parseBounds(value: string | null) {
  const parts = value?.split(",").map(Number);
  if (!parts || parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
  const [south, west, north, east] = parts;
  return { south, west, north, east };
}

export type DealerSearchResult = {
  items: Dealer[]; // карточки текущей страницы
  pins: DealerPin[]; // все подходящие под фильтры — метки на карте (без учёта области карты)
  total: number;
  page: number;
  pageCount: number;
};

export async function searchDealers(params: Params): Promise<DealerSearchResult> {
  const text = (key: string) => params.get(key)?.trim() ?? "";
  const rows = await matchingRows(text("q"), text("type"), text("city"), text("brand"));

  // часы работы — в jsonb, «открыто сейчас» считаем по времени Риги здесь, а не в SQL
  const now = Date.now();
  const filtered = rows
    .filter((d) => params.get("open") !== "1" || getOpenStatus(d.hours, now).open);

  // список — только видимые на карте, если включён «Искать при перемещении карты»
  const bounds = parseBounds(params.get("bounds"));
  const listed = bounds
    ? filtered.filter((d) => d.lat >= bounds.south && d.lat <= bounds.north && d.lng >= bounds.west && d.lng <= bounds.east)
    : filtered;

  const pageCount = Math.max(1, Math.ceil(listed.length / DEALERS_PAGE_SIZE));
  const page = Math.min(Math.max(1, Math.floor(Number(params.get("page")) || 1)), pageCount);

  return {
    items: listed.slice((page - 1) * DEALERS_PAGE_SIZE, page * DEALERS_PAGE_SIZE),
    pins: filtered.map(({ slug, name, lat, lng, address, city, hours, carsInStock }) => ({
      slug, name, lat, lng, address, city, hours, carsInStock,
    })),
    total: listed.length,
    page,
    pageCount,
  };
}
