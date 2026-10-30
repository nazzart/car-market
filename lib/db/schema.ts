// Таблицы базы данных. После изменения: npm run db:generate (создаёт SQL-миграцию) → npm run db:migrate.
// Имена колонок в базе — snake_case (casing в lib/db/index.ts и drizzle.config.ts), в коде — camelCase.
// RLS включён везде без правил: публичный ключ Supabase не читает и не меняет таблицы напрямую,
// всё идёт через сервер Next.js (features/*/api.ts), который подключается к базе как владелец
import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

import type { DamageMap } from "@/features/cars/config/damage";
import type {
  Drive,
  Fuel,
  MileageLatvia,
  OverallCondition,
  ServiceState,
  Transmission,
} from "@/features/cars/types";
import type { Dealer, OpeningHours } from "@/features/dealers/types";
import type { ListingStatus } from "@/features/account/listings/status";
import type { BlockReason, LogAction, Moderation, Report } from "@/features/moderation/types";

// Блокировка аккаунта модератором (дилер или пользователь): все его объявления скрыты
const blockColumns = () => ({
  blockedReason: text().$type<BlockReason>(),
  blockedNote: text(),
  blockedAt: timestamp({ withTimezone: true }),
});

// Значения для CHECK: только из списка (как в features/cars/config/filterOptions.ts и типах)
const oneOf = (column: unknown, values: string[]) => sql`${column} in (${sql.raw(values.map((v) => `'${v}'`).join(", "))})`;

/* ---------- Каталог: марки, модели, версии ---------- */
// Редактирует модератор в /admin (вкладка «Katalogs»). Начальные данные — из открытых данных RDW
// (npm run catalog:build → scripts/catalog/rdw-catalog.json, загружены миграцией 0007)

// Связи — по числовым id: переименование марки или модели — одна строка в каталоге, объявления не меняются.
// slug — адрес и фильтр (/cars?brand=bmw), после создания не меняется; название можно исправить
export const carBrands = pgTable("car_brands", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  slug: text().notNull().unique(),
  name: text().notNull().unique(),
  popular: boolean().notNull().default(false), // сверху в списках марок
  hidden: boolean().notNull().default(false), // скрыта из списков (объявления остаются)
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

// Модель марки; объявление ссылается на неё по id (listings.model_id)
export const carModels = pgTable(
  "car_models",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    brandId: integer()
      .notNull()
      .references(() => carBrands.id, { onDelete: "restrict" }),
    name: text().notNull(),
    hidden: boolean().notNull().default(false),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.brandId, t.name)]
).enableRLS();

// Версии модели («530d», «E 220 CDI») — подсказки в форме подачи и группы в фильтре /cars.
// У объявления версия — свободный текст (может быть точнее каталога: «530d xDrive Touring»)
export const carVersions = pgTable(
  "car_versions",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    modelId: integer()
      .notNull()
      .references(() => carModels.id, { onDelete: "cascade" }),
    name: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.modelId, t.name)]
).enableRLS();

/* ---------- Дилеры и аккаунты ---------- */

export const dealers = pgTable("dealers", {
  // числовой ключ: на него ссылаются объявления и контакты. slug — адрес страницы (/dealers/baltic-auto),
  // его можно поменять при переименовании, не трогая объявления
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  type: text().$type<Dealer["type"]>().notNull(),
  city: text().notNull(), // ключ места из lib/places.ts
  address: text().notNull(),
  lat: doublePrecision().notNull(),
  lng: doublePrecision().notNull(),
  phone: text().notNull(),
  regNumber: text(),
  verified: boolean().notNull().default(false),
  hours: jsonb().$type<OpeningHours>().notNull().default({}),
  rating: real(),
  reviews: integer(),
  since: integer().notNull(),
  description: text(),
  ...blockColumns(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
},
  // одна компания — одна страница дилера
  (t) => [uniqueIndex("dealers_reg_number_unique").on(t.regNumber).where(sql`${t.regNumber} is not null`)]
).enableRLS();

// Марки официального дилера (страница дилера, фильтр «марка» в /dealers)
export const dealerBrands = pgTable(
  "dealer_brands",
  {
    dealerId: integer()
      .notNull()
      .references(() => dealers.id, { onDelete: "cascade" }),
    brandId: integer()
      .notNull()
      .references(() => carBrands.id, { onDelete: "restrict" }),
  },
  (t) => [primaryKey({ columns: [t.dealerId, t.brandId] }), index().on(t.brandId)]
).enableRLS();

// Аккаунт на сайте. Вход и пароль — Supabase Auth (схема auth, таблица users), здесь — данные профиля.
// id совпадает с auth.users.id; email хранится только в auth.users
export const profiles = pgTable("profiles", {
  id: uuid()
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  type: text().$type<"individual" | "dealer">().notNull(),
  name: text().notNull(),
  phone: text().notNull().default(""),
  // ключ места из lib/places.ts. Пусто, пока пользователь не выбрал (в настройках или при первом объявлении)
  city: text(),
  role: text().$type<"admin">(), // модератор: доступ к /admin
  // у аккаунта компании — её страница дилера
  dealerId: integer()
    .unique()
    .references(() => dealers.id, { onDelete: "set null" }),
  ...blockColumns(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

// Контактные лица дилера (менеджеры), position — порядок в списке
export const dealerContacts = pgTable(
  "dealer_contacts",
  {
    id: text().primaryKey(),
    dealerId: integer()
      .notNull()
      .references(() => dealers.id, { onDelete: "cascade" }),
    name: text().notNull(),
    phone: text().notNull(),
    role: text(),
    position: integer().notNull().default(0),
  },
  (t) => [
    index().on(t.dealerId, t.position),
    // для ссылки объявления (дилер, контакт): контакт — только своего дилера
    unique("dealer_contacts_dealer_id_id_unique").on(t.dealerId, t.id),
  ]
).enableRLS();

export const listings = pgTable(
  "listings",
  {
    // by default, а не always: демо-объявления сохраняют свои номера (/listing/1)
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    // модель из каталога; марка — через модель (car_models.brand_id). Названия — при чтении (JOIN)
    modelId: integer()
      .notNull()
      .references(() => carModels.id, { onDelete: "restrict" }),
    // версия внутри модели: «530d xDrive», «E 220 CDI» — в заголовке и фильтре «Версия». null — не указана
    version: text(),
    title: text().notNull(),
    year: smallint().notNull(),
    price: integer().notNull(),
    mileage: integer().notNull(),
    engine: real(), // л, null — электро
    power: smallint().notNull(),
    fuel: text().$type<Fuel>().notNull(),
    transmission: text().$type<Transmission>().notNull(),
    drive: text().$type<Drive>().notNull(),
    bodyType: text().notNull(),
    condition: text().$type<"used" | "new">().notNull(),
    // Продавец. Дилер — ссылка: имя и телефон берутся из dealers / dealer_contacts при чтении (JOIN), не копируются.
    // Частный продавец — имя и телефон хранятся здесь: в форме подачи их можно изменить для конкретного объявления
    dealerId: integer().references(() => dealers.id, { onDelete: "cascade" }), // null — частный продавец
    // нет — основной телефон дилера. Ссылка (dealer_id, contact_id) → dealer_contacts: контакт только своего дилера;
    // при удалении контакта обнуляется только contact_id — ограничение в миграции 0007 (Drizzle так не умеет)
    contactId: text(),
    // владелец — частный продавец (у дилерских владелец — дилер). null — объявление без аккаунта
    userId: uuid().references(() => profiles.id, { onDelete: "cascade" }),
    sellerName: text(),
    phone: text(),
    city: text().notNull(), // где стоит машина — ключ места из lib/places.ts (у дилера может быть несколько площадок)
    images: text().array().notNull().default(sql`'{}'`),
    review: text().$type<"pending">(), // 'pending' — на проверке, покупателям не видно
    postedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    status: text().$type<ListingStatus>().notNull().default("active"), // продавец: активно / скрыто / продано / удалено

    // решение модератора — важнее статуса продавца
    moderationStatus: text().$type<Moderation["status"]>(),
    moderationReason: text().$type<BlockReason>(),
    moderationNote: text(),
    moderatedAt: timestamp({ withTimezone: true }),
    excludedCollections: text().array().notNull().default(sql`'{}'`), // модератор убрал из подборок (slug)

    color: text(),
    owners: smallint(),
    vin: text(),
    inspectionUntil: text(), // «MM.YYYY»
    noAccidents: boolean(),
    negotiable: boolean(),
    description: text(),
    videoUrl: text(),
    equipment: text().array(),
    sellerSince: smallint(),
    views: integer().notNull().default(0),
    damages: jsonb().$type<DamageMap>(),

    overallCondition: text().$type<OverallCondition>(),
    service: text().$type<ServiceState>(),
    serviceBook: boolean(),
    mileageLatvia: text().$type<MileageLatvia>(),
  },
  // Индексы под поиск: марка/модель, цена, год, место, новые сверху. Только опубликованные — частичные индексы
  (t) => [
    index().on(t.modelId).where(sql`${t.review} is null`),
    index().on(t.postedAt).where(sql`${t.review} is null`),
    index().on(t.price),
    index().on(t.year),
    index().on(t.city),
    index().on(t.dealerId),
    index().on(t.userId),
    index().on(t.contactId),
    // у частного объявления должен быть телефон; у дилерского он берётся из dealers
    check("listings_private_phone", sql`${t.dealerId} is not null or ${t.phone} is not null`),
    // владелец — дилер или частное лицо, не оба
    check("listings_one_owner", sql`${t.dealerId} is null or ${t.userId} is null`),
    // значения — только из списков (features/cars/config/filterOptions.ts, features/account/listings/status.ts)
    check("listings_status", oneOf(t.status, ["active", "paused", "sold", "deleted"])),
    check("listings_condition", oneOf(t.condition, ["used", "new"])),
    check("listings_fuel", oneOf(t.fuel, ["petrol", "diesel", "hybrid", "electric", "gas"])),
    check("listings_transmission", oneOf(t.transmission, ["automatic", "manual"])),
    check("listings_drive", oneOf(t.drive, ["fwd", "rwd", "awd"])),
    check(
      "listings_body_type",
      oneOf(t.bodyType, ["sedan", "suv", "wagon", "hatchback", "coupe", "convertible", "minivan", "pickup"])
    ),
    check("listings_review", sql`${t.review} is null or ${t.review} = 'pending'`),
  ]
).enableRLS();

// Избранное: только для вошедших. price — цена в момент добавления (показываем, если подешевело)
export const favorites = pgTable(
  "favorites",
  {
    userId: uuid()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    listingId: bigint({ mode: "number" })
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    price: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.listingId] }),
    index().on(t.listingId), // «сколько человек сохранили» и удаление объявления
  ]
).enableRLS();

// Жалобы покупателей на объявления
export const reports = pgTable(
  "reports",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    listingId: bigint({ mode: "number" })
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    reporterId: uuid().references(() => profiles.id, { onDelete: "set null" }), // null — без входа
    reason: text().$type<BlockReason>().notNull(),
    text: text(),
    resolved: text().$type<NonNullable<Report["resolved"]>>(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index().on(t.listingId),
    // одна жалоба вошедшего пользователя на объявление
    uniqueIndex("reports_reporter_listing_unique").on(t.reporterId, t.listingId).where(sql`${t.reporterId} is not null`),
  ]
).enableRLS();

// Журнал решений модераторов
export const moderationLog = pgTable(
  "moderation_log",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    actorId: uuid().references(() => profiles.id, { onDelete: "set null" }),
    listingId: bigint({ mode: "number" }).references(() => listings.id, { onDelete: "set null" }),
    account: text(), // «dealer:<slug>» / «user:<uuid>»
    action: text().$type<LogAction>().notNull(),
    reason: text().$type<BlockReason>(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.createdAt)]
).enableRLS();
