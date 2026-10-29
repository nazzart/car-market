// Дилеры на сервере: SQL-запросы к таблицам dealers и dealer_contacts. Страницы и sitemap вызывают эти функции,
// клиентские компоненты — хуки из ./hooks. Кэш с тегом "dealers"; после изменения — revalidateTag("dealers")
import "server-only";

import { unstable_cache } from "next/cache";
import { type SQL, and, arrayContains, asc, desc, eq, ilike, or, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";

import { getOpenStatus } from "./lib/openStatus";
import type { Dealer, DealerContact, DealerPin } from "./types";

const { dealers, dealerContacts } = schema;

type Row = typeof dealers.$inferSelect;

function toDealer(row: Row, contacts: DealerContact[]): Dealer {
  // необязательные поля без значения — undefined, как в типе Dealer; внутренний номер и даты наружу не отдаём —
  // снаружи дилер известен по slug
  const fields = Object.fromEntries(
    Object.entries(row).filter(([key, value]) => value !== null && key !== "createdAt" && key !== "id")
  );
  return { ...(fields as Omit<Dealer, "contacts">), ...(contacts.length ? { contacts } : {}) };
}

// Дилеров немного (сотни), поэтому каталог читается целиком двумя запросами и кэшируется
const catalog = unstable_cache(
  async () => {
    const [rows, contacts] = await Promise.all([
      db.select().from(dealers).orderBy(asc(dealers.name)),
      db.select().from(dealerContacts).orderBy(asc(dealerContacts.dealerId), asc(dealerContacts.position)),
    ]);
    return rows.map((row) =>
      toDealer(
        row,
        contacts
          .filter((c) => c.dealerId === row.id)
          .map(({ id, name, phone, role }) => ({ id, name, phone, ...(role ? { role } : {}) }))
      )
    );
  },
  ["dealers", "catalog"],
  { tags: ["dealers"], revalidate: 300 }
);

export async function getDealer(slug: string): Promise<Dealer | undefined> {
  return (await catalog()).find((d) => d.slug === slug);
}

// Весь каталог, включая заблокированных (модерация). Страница /dealers — searchDealers()
export async function getDealers(): Promise<Dealer[]> {
  return catalog();
}

// Всего дилеров — для подзаголовка «14 uzņēmumi visā Latvijā»
export async function countDealers(): Promise<number> {
  return (await catalog()).length;
}

/* ---------- Страница /dealers: фильтры, карта, постраничный список ---------- */

export const DEALERS_PAGE_SIZE = 10;

type Params = { get: (key: string) => string | null };

// Варианты для фильтров: города, где есть дилеры, и марки официальных дилеров
const filterOptions = unstable_cache(
  async () => {
    const [cities, brands] = await Promise.all([
      db.selectDistinct({ city: dealers.city }).from(dealers),
      db.execute<{ brand: string }>(sql`select distinct unnest(${dealers.brands}) as brand from ${dealers}`),
    ]);
    return { cities: cities.map((r) => r.city), brands: brands.rows.map((r) => r.brand) };
  },
  ["dealers", "filterOptions"],
  { tags: ["dealers"], revalidate: 300 }
);

export async function getDealerFilterOptions(): Promise<{ cities: string[]; brands: string[] }> {
  return filterOptions();
}

// Поиск по названию или адресу: «%» и «_» из ввода — обычные символы, а не шаблон
const likeText = (text: string) => `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

// Фильтры из URL → SQL. Результат кэшируется: «открыто сейчас» и область карты считаются после, на каждый запрос
const matchingRows = unstable_cache(
  async (q: string, type: string, city: string, brand: string) => {
    const conditions: (SQL | undefined)[] = [];
    if (q) conditions.push(or(ilike(dealers.name, likeText(q)), ilike(dealers.address, likeText(q))));
    if (type) conditions.push(eq(dealers.type, type as Dealer["type"]));
    if (city) conditions.push(eq(dealers.city, city));
    if (brand) conditions.push(arrayContains(dealers.brands, [brand]));
    // проверенные — выше, дальше по алфавиту
    return db
      .select()
      .from(dealers)
      .where(and(...conditions))
      .orderBy(desc(dealers.verified), asc(dealers.name));
  },
  ["dealers", "search"],
  { tags: ["dealers"], revalidate: 300 }
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
    .map((row) => toDealer(row, []))
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
