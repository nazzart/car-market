// Подача объявления на сервере: модель — из каталога, версия — к каталожному написанию, запись в listings.
// Новое объявление ждёт модератора (review = 'pending', вкладка «Apstiprināšana» в /admin).
// Получает уже проверенного пользователя (requireUser в ./actions)
import "server-only";

import { and, count, eq, gte } from "drizzle-orm";

import { ownDealerId } from "@/features/account/api";
import type { User } from "@/features/auth/types";
import { listingTitle, normalizeVersion } from "@/features/cars/lib/version";
import { db, schema } from "@/lib/db";
import { publicUrl } from "@/lib/storage";

import { parseListing } from "./lib/parseListing";
import type { SellFormData } from "./types";

const { listings, carBrands, carModels, carVersions, dealerContacts } = schema;

// защита от потока объявлений с одного аккаунта: не больше 20 за сутки
const DAILY_LIMIT = 20;

export type CreateListingResult =
  | { ok: true; id: string }
  | { ok: false; error: "invalid"; fields: string[] }
  | { ok: false; error: "model" | "tooMany" | "blocked" };

// Папка фото пользователя в хранилище: listings/{userId}/
export const photoFolder = (user: User) => `listings/${user.id}/`;

export async function createListing(user: User, input: Partial<SellFormData>): Promise<CreateListingResult> {
  if (user.blocked) return { ok: false, error: "blocked" };

  const dealerId = (await ownDealerId(user)) ?? null;
  const isDealer = dealerId !== null;
  const parsed = parseListing(input, { isDealer, photoPrefix: publicUrl(photoFolder(user)) });
  if (!parsed.ok) return { ok: false, error: "invalid", fields: parsed.fields };
  const { brand, model: modelName, version: rawVersion, contactId, ...fields } = parsed.value;

  // только модели из каталога (скрытые модератором — нельзя)
  const [model] = await db
    .select({ id: carModels.id, name: carModels.name, brandName: carBrands.name })
    .from(carModels)
    .innerJoin(carBrands, eq(carBrands.id, carModels.brandId))
    .where(and(eq(carBrands.slug, brand), eq(carModels.name, modelName), eq(carModels.hidden, false), eq(carBrands.hidden, false)));
  if (!model) return { ok: false, error: "model" };

  const known = await db.select({ name: carVersions.name }).from(carVersions).where(eq(carVersions.modelId, model.id));
  const version = normalizeVersion(rawVersion, known.map((v) => v.name)) || null;

  // контактное лицо — только своего дилера; чужое или удалённое — телефон компании
  const contact =
    isDealer && contactId
      ? (await db.select({ id: dealerContacts.id }).from(dealerContacts).where(and(eq(dealerContacts.id, contactId), eq(dealerContacts.dealerId, dealerId))))[0]
      : undefined;

  const owner = isDealer ? eq(listings.dealerId, dealerId) : eq(listings.userId, user.id);
  const [{ n: today }] = await db
    .select({ n: count() })
    .from(listings)
    .where(and(owner, gte(listings.postedAt, new Date(Date.now() - 24 * 60 * 60_000))));
  if (today >= DAILY_LIMIT) return { ok: false, error: "tooMany" };

  const [row] = await db
    .insert(listings)
    .values({
      ...fields,
      modelId: model.id,
      version,
      title: listingTitle(model.brandName, model.name, version),
      // в форме нет выбора «новый/подержанный»: пробег до 100 km — новая машина (фильтр «Jauni» в /cars)
      condition: fields.mileage < 100 ? "new" : "used",
      review: "pending",
      status: "active",
      // продавец: дилер — ссылкой (имя и телефон берутся при чтении), частное лицо — имя и телефон здесь
      ...(isDealer ? { dealerId, contactId: contact?.id ?? null } : { userId: user.id, sellerName: user.name }),
      sellerSince: user.since,
    })
    .returning({ id: listings.id });

  return { ok: true, id: String(row.id) };
}

