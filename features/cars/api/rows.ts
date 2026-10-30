// Объявления на сервере: общая основа запросов — строка базы → Listing, правило «опубликовано»,
// правила подборок и кэш. Поиск — ./search.ts, отдельные объявления и счётчики — ./index.ts
import "server-only";

import { unstable_cache } from "next/cache";
import { type SQL, and, desc, eq, getTableColumns, gte, inArray, isNull, lte, or, sql } from "drizzle-orm";

import { EXOTIC_BRANDS } from "@/features/collections/config";
import type { BlockReason } from "@/features/moderation/types";
import { db, schema } from "@/lib/db";
import { CACHE_VERSION } from "@/lib/db/cacheVersion";

import type { Listing } from "../types";

const { listings, dealers, dealerContacts, profiles, carBrands, carModels } = schema;

export type Params = { get: (key: string) => string | null };

/* ---------- Строка базы → Listing ---------- */

// Объявление вместе с продавцом. У дилерского имя и телефон не хранятся в listings, а берутся при чтении:
// имя — из dealers, телефон — контактного лица (dealer_contacts) или основной телефон дилера
// и блокировка аккаунта продавца модератором — из dealers или profiles
const listingColumns = {
  ...getTableColumns(listings),
  // марка и модель — из каталога по model_id
  brand: carBrands.slug,
  brandName: carBrands.name,
  model: carModels.name,
  dealerSlug: dealers.slug,
  dealerName: dealers.name,
  dealerVerified: dealers.verified,
  dealerPhone: dealers.phone,
  contactPhone: dealerContacts.phone,
  contactName: dealerContacts.name,
  contactRole: dealerContacts.role,
  blockedReason: sql<BlockReason | null>`coalesce(${dealers.blockedReason}, ${profiles.blockedReason})`,
  blockedNote: sql<string | null>`coalesce(${dealers.blockedNote}, ${profiles.blockedNote})`,
  blockedAt: sql<string | null>`coalesce(${dealers.blockedAt}, ${profiles.blockedAt})`,
};

export const selectListings = () =>
  db
    .select(listingColumns)
    .from(listings)
    .innerJoin(carModels, eq(carModels.id, listings.modelId))
    .innerJoin(carBrands, eq(carBrands.id, carModels.brandId))
    .leftJoin(dealers, eq(dealers.id, listings.dealerId))
    .leftJoin(dealerContacts, eq(dealerContacts.id, listings.contactId))
    .leftJoin(profiles, eq(profiles.id, listings.userId));

// Минуты с публикации считаются при каждом чтении, а не хранятся в кэше
type Row = Awaited<ReturnType<typeof selectListings>>[number];
type CachedRow = Omit<Row, "postedAt"> & { postedAt: Date | string }; // из кэша дата приходит строкой

const time = (value: Date | string | null) => (value === null ? 0 : new Date(value).getTime());

export function toListing({
  id,
  dealerId,
  dealerSlug,
  dealerName,
  dealerVerified,
  dealerPhone,
  contactPhone,
  contactName,
  contactRole,
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
    ...(dealerSlug ? { dealer: dealerSlug, dealerVerified: Boolean(dealerVerified) } : {}),
    ...(name ? { sellerName: name } : {}),
    phone: contactPhone ?? dealerPhone ?? phone ?? "",
    ...(contactName ? { contactPerson: { name: contactName, ...(contactRole ? { role: contactRole } : {}) } } : {}),
    engine,
    postedMinutesAgo: Math.max(0, Math.round((Date.now() - time(postedAt)) / 60_000)),
    ...(moderationStatus && moderationReason
      ? { moderation: { status: moderationStatus, reason: moderationReason, note: moderationNote ?? undefined, at: time(moderatedAt) } }
      : {}),
    ...(blockedReason ? { accountBlock: { reason: blockedReason, note: blockedNote ?? undefined, at: time(blockedAt) } } : {}),
    ...(excludedCollections?.length ? { excludedCollections } : {}),
  };
}

// Для чужих глаз (страница объявления, избранное, сравнение): без заметок модератора — их видит только продавец
export const forPublic = (listing: Listing): Listing => ({
  ...listing,
  ...(listing.moderation ? { moderation: { ...listing.moderation, note: undefined } } : {}),
  ...(listing.accountBlock ? { accountBlock: { ...listing.accountBlock, note: undefined } } : {}),
});

// Объявления дилера по slug из URL — через вложенный запрос, без JOIN в подсчётах
export const ofDealer = (slug: string) =>
  inArray(listings.dealerId, db.select({ id: dealers.id }).from(dealers).where(eq(dealers.slug, slug)));

// Тег "dealers" тоже: объявления читают имя и телефон дилера (JOIN), изменение дилера должно обновить и их
export const cached = <Args extends unknown[], Result>(fn: (...args: Args) => Promise<Result>, key: string) =>
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

// Объявления марки (и модели) — по каталогу: model_id из моделей этой марки. Для WHERE без JOIN каталога
export const ofModels = (brand: string | string[], model?: string) =>
  inArray(
    listings.modelId,
    db
      .select({ id: carModels.id })
      .from(carModels)
      .innerJoin(carBrands, eq(carBrands.id, carModels.brandId))
      .where(
        and(
          Array.isArray(brand) ? inArray(carBrands.slug, brand) : eq(carBrands.slug, brand),
          model === undefined ? undefined : eq(carModels.name, model)
        )
      )
  );

// Подборка — по её правилу, кроме объявлений, которые модератор из неё убрал
export const inCollection = (slug: string) =>
  and(collectionWhere[slug], sql`not (${slug} = any(${listings.excludedCollections}))`);
export const newestFirst = [desc(listings.postedAt), desc(listings.id)];

// Правила подборок на SQL. Должны совпадать с collection.matches в features/collections/config.ts
export const collectionWhere: Record<string, SQL | undefined> = {
  retro: lte(listings.year, 1995),
  sport: and(inArray(listings.bodyType, ["coupe", "convertible"]), gte(listings.power, 300)),
  exotic: or(ofModels(EXOTIC_BRANDS), gte(listings.price, 100_000)),
  electric: eq(listings.fuel, "electric"),
};
