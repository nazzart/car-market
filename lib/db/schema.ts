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
  real,
  smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

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

export const dealers = pgTable("dealers", {
  // числовой ключ: на него ссылаются объявления и контакты. slug — адрес страницы (/dealers/baltic-auto),
  // его можно поменять при переименовании, не трогая объявления
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  type: text().$type<Dealer["type"]>().notNull(),
  brands: text().array().notNull().default(sql`'{}'`), // slug марок — для официальных дилеров
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
  carsInStock: integer().notNull().default(0),
  since: integer().notNull(),
  description: text(),
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
  (t) => [index().on(t.dealerId, t.position)]
).enableRLS();

export const listings = pgTable(
  "listings",
  {
    // by default, а не always: демо-объявления сохраняют свои номера (/listing/1)
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    brand: text().notNull(), // slug марки
    model: text().notNull(),
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
    // Частный продавец — имя и телефон хранятся здесь. TODO(auth): брать из профиля пользователя, как у дилеров
    dealerId: integer().references(() => dealers.id, { onDelete: "cascade" }), // null — частный продавец
    contactId: text().references(() => dealerContacts.id, { onDelete: "set null" }), // нет — основной телефон дилера
    // TODO(auth): uuid со ссылкой на пользователя Supabase Auth; пока — id демо-аккаунта
    userId: text(),
    sellerName: text(),
    phone: text(),
    city: text().notNull(), // где стоит машина — ключ места из lib/places.ts (у дилера может быть несколько площадок)
    images: text().array().notNull().default(sql`'{}'`),
    review: text().$type<"pending">(), // 'pending' — на проверке, покупателям не видно
    postedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),

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
    index().on(t.brand, t.model).where(sql`${t.review} is null`),
    index().on(t.postedAt).where(sql`${t.review} is null`),
    index().on(t.price),
    index().on(t.year),
    index().on(t.city),
    index().on(t.dealerId),
    index().on(t.userId),
    // у частного объявления должен быть телефон; у дилерского он берётся из dealers
    check("listings_private_phone", sql`${t.dealerId} is not null or ${t.phone} is not null`),
  ]
).enableRLS();
