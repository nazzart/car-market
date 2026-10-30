// Кабинет на сервере: свои объявления, их статусы и контактные лица, настройки профиля и страницы дилера.
// Каждая функция получает уже проверенного пользователя (requireUser в ./actions) и меняет только его данные
import "server-only";

import { and, eq, inArray, isNull, notInArray, sql } from "drizzle-orm";

import type { User } from "@/features/auth/types";
import type { DealerContact, OpeningHours } from "@/features/dealers/types";
import { db, schema } from "@/lib/db";

import type { ListingStatus } from "./listings/status";

const { listings, dealers, dealerContacts, profiles, dealerBrands, carBrands } = schema;

const dealerIdOf = async (user: User) => {
  if (user.type !== "dealer" || !user.dealerSlug) return null;
  const [row] = await db.select({ id: dealers.id }).from(dealers).where(eq(dealers.slug, user.dealerSlug));
  return row?.id ?? null;
};
// id своей страницы дилера (проверка регистрационного номера в настройках)
export const ownDealerId = async (user: User) => (await dealerIdOf(user)) ?? undefined;

// Объявления пользователя: у дилера — его компании, у частного лица — свои
async function ownedBy(user: User) {
  const dealerId = await dealerIdOf(user);
  return dealerId !== null ? eq(listings.dealerId, dealerId) : eq(listings.userId, user.id);
}

// Статус от продавца. Заблокированное модератором из кабинета снова не включить
export async function setOwnListingStatus(user: User, listingId: number, status: ListingStatus) {
  const updated = await db
    .update(listings)
    .set({ status })
    .where(and(eq(listings.id, listingId), await ownedBy(user), isNull(listings.moderationStatus)))
    .returning({ id: listings.id });
  return updated.length > 0;
}

export type ProfileFields = { name: string; phone: string; city: string | null };

export async function saveOwnProfile(user: User, fields: ProfileFields) {
  await db.update(profiles).set(fields).where(eq(profiles.id, user.id));
}

export type DealerFields = {
  name: string;
  phone: string;
  type: "official" | "used";
  brands: string[];
  regNumber: string;
  description: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  hours: OpeningHours;
  showContactPerson: boolean;
  contacts: DealerContact[];
  reassign: Record<string, string>; // удалённый контакт → кому передать его объявления ("company" — основной телефон)
};

// Страница дилера и контактные лица — одной транзакцией. Имя и телефон компании — также в профиле аккаунта
export async function saveOwnDealer(user: User, fields: DealerFields) {
  const dealerId = await dealerIdOf(user);
  if (dealerId === null) return false;

  await db.transaction(async (tx) => {
    const { contacts, reassign, brands, ...dealer } = fields;
    // смена регистрационного номера снимает значок «Проверенный» — модератор сверит заново
    await tx
      .update(dealers)
      .set({ ...dealer, verified: sql`${dealers.verified} and ${dealers.regNumber} = ${dealer.regNumber}` })
      .where(eq(dealers.id, dealerId));
    // марки официального дилера — заново по slug из каталога (неизвестные пропускаются)
    await tx.delete(dealerBrands).where(eq(dealerBrands.dealerId, dealerId));
    if (brands.length) {
      const ids = await tx.select({ id: carBrands.id }).from(carBrands).where(inArray(carBrands.slug, brands));
      if (ids.length) await tx.insert(dealerBrands).values(ids.map(({ id }) => ({ dealerId, brandId: id })));
    }
    await tx.update(profiles).set({ name: fields.name, phone: fields.phone }).where(eq(profiles.id, user.id));

    // id контакта, занятый другим дилером, не перехватываем — даём новый
    const taken = new Set(
      contacts.length
        ? (
            await tx
              .select({ id: dealerContacts.id })
              .from(dealerContacts)
              .where(and(inArray(dealerContacts.id, contacts.map((c) => c.id)), sql`${dealerContacts.dealerId} <> ${dealerId}`))
          ).map((r) => r.id)
        : []
    );
    const rows = contacts.map((c, position) => ({
      id: taken.has(c.id) ? `c-${crypto.randomUUID()}` : c.id,
      dealerId,
      name: c.name,
      phone: c.phone,
      role: c.role ?? null,
      position,
    }));

    // объявления удалённых контактов — тому, кого выбрал дилер
    const keep = rows.map((r) => r.id);
    for (const [from, to] of Object.entries(reassign)) {
      if (keep.includes(from)) continue;
      await tx
        .update(listings)
        .set({ contactId: to !== "company" && keep.includes(to) ? to : null })
        .where(and(eq(listings.dealerId, dealerId), eq(listings.contactId, from)));
    }
    // ссылки на удалённые контакты обнулит внешний ключ (ON DELETE SET NULL)
    await tx
      .delete(dealerContacts)
      .where(and(eq(dealerContacts.dealerId, dealerId), keep.length ? notInArray(dealerContacts.id, keep) : undefined));
    if (rows.length) {
      await tx
        .insert(dealerContacts)
        .values(rows)
        .onConflictDoUpdate({
          target: dealerContacts.id,
          set: { name: sql`excluded.name`, phone: sql`excluded.phone`, role: sql`excluded.role`, position: sql`excluded.position` },
        });
    }
  });
  return true;
}

export async function saveDealerPhone(user: User, phone: string) {
  const dealerId = await dealerIdOf(user);
  if (dealerId !== null) await db.update(dealers).set({ phone }).where(eq(dealers.id, dealerId));
}

// Новое контактное лицо прямо из формы продажи (без сохранения всей страницы дилера)
export async function addOwnContact(user: User, contact: DealerContact) {
  const dealerId = await dealerIdOf(user);
  if (dealerId === null) return null;
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(dealerContacts)
    .where(eq(dealerContacts.dealerId, dealerId));
  const [row] = await db
    .insert(dealerContacts)
    .values({ id: `c-${crypto.randomUUID()}`, dealerId, name: contact.name, phone: contact.phone, role: contact.role ?? null, position: count })
    .returning({ id: dealerContacts.id });
  return row.id;
}

// Удаление аккаунта. Вход (auth.users) удаляется — вместе с ним база удаляет профиль, избранное и объявления
// частного лица (ON DELETE CASCADE). У компании — ещё и страница дилера с её объявлениями и контактами.
// Жалобы и журнал модерации остаются без ссылки на автора (SET NULL)
export async function deleteOwnAccount(user: User) {
  const dealerId = await dealerIdOf(user);
  await db.transaction(async (tx) => {
    if (dealerId !== null) await tx.delete(dealers).where(eq(dealers.id, dealerId));
    await tx.execute(sql`delete from auth.users where id = ${user.id}`);
  });
}
