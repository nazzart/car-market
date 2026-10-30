"use server";

// Кабинет: Server Actions. Сначала — кто вошёл (requireUser), затем проверка ввода, затем запись в базу
// и updateTag — страницы с этими данными сразу показывают новое
import { updateTag } from "next/cache";

import { regNumberTaken, requireUser } from "@/features/auth/api";
import type { User } from "@/features/auth/types";
import { getDealerListings, getUserListings } from "@/features/cars/api";
import type { Listing } from "@/features/cars/types";
import { getDealerUncached } from "@/features/dealers/api";
import { DAYS, type Dealer, type DealerContact, type OpeningHours } from "@/features/dealers/types";
import { isPhone } from "@/lib/phone";
import { findPlace } from "@/lib/places";
import { cleanText, isListingId, isRegNumber, normalizeRegNumber } from "@/lib/validate";
import { createSupabase } from "@/lib/supabase/server";

import {
  type DealerFields,
  addOwnContact,
  deleteOwnAccount,
  ownDealerId,
  saveDealerPhone,
  saveOwnDealer,
  saveOwnProfile,
  setOwnListingStatus,
} from "./api";
import { LISTING_STATUSES, type ListingStatus } from "./listings/status";

const text = cleanText;

// Объявления вошедшего: у дилера — его компании, у частного лица — свои (включая скрытые и проданные)
export async function loadOwnListings(): Promise<Listing[]> {
  const user = await requireUser();
  return user.type === "dealer" && user.dealerSlug ? getDealerListings(user.dealerSlug) : getUserListings(user.id);
}

// Страница дилера вошедшей компании — свежая из базы (каталог в layout кэшируется до 5 минут)
export async function loadOwnDealer(): Promise<Dealer | null> {
  const user = await requireUser();
  if (user.type !== "dealer" || !user.dealerSlug) return null;
  return (await getDealerUncached(user.dealerSlug)) ?? null;
}

export async function setListingStatus(id: string, status: ListingStatus): Promise<boolean> {
  const user = await requireUser();
  if (!isListingId(id) || !LISTING_STATUSES.includes(status)) return false;
  const ok = await setOwnListingStatus(user, Number(id), status);
  if (ok) updateTag("listings");
  return ok;
}

// Новый email подтверждается письмом на него (Supabase); до подтверждения действует старый
async function changeEmail(user: User, email: string): Promise<"changed" | "confirm" | "invalid"> {
  if (!email || email === user.email) return "changed";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "invalid";
  const supabase = await createSupabase();
  const { data, error } = await supabase.auth.updateUser({ email });
  if (error) return "invalid";
  return data.user?.new_email ? "confirm" : "changed";
}

export type SaveResult = { ok: true; user: User; emailPending?: boolean } | { error: "invalid" | "regTaken" };

export async function saveProfile(input: { name: string; email: string; phone: string; city: string }): Promise<SaveResult> {
  const user = await requireUser();
  const city = text(input?.city, 60);
  const fields = { name: text(input?.name, 120), phone: text(input?.phone, 40), city: city || null };
  if (!fields.name || !isPhone(fields.phone) || (city && !findPlace(city))) return { error: "invalid" };

  await saveOwnProfile(user, fields);
  const email = await changeEmail(user, text(input.email, 200).toLowerCase());
  if (email === "invalid") return { error: "invalid" };
  return { ok: true, user: { ...user, name: fields.name, phone: fields.phone, city: city || undefined }, emailPending: email === "confirm" };
}

const validHours = (hours: unknown): hours is OpeningHours =>
  typeof hours === "object" &&
  hours !== null &&
  Object.entries(hours).every(
    ([day, value]) =>
      DAYS.includes(day as (typeof DAYS)[number]) &&
      typeof value?.open === "string" &&
      typeof value?.close === "string" &&
      /^\d{2}:\d{2}$/.test(value.open) &&
      /^\d{2}:\d{2}$/.test(value.close)
  );

const validContacts = (list: unknown): DealerContact[] | null => {
  if (!Array.isArray(list) || list.length > 50) return null;
  const contacts = list.map((c) => ({
    id: text(c?.id, 80),
    name: text(c?.name, 120),
    phone: text(c?.phone, 40),
    ...(text(c?.role, 80) ? { role: text(c?.role, 80) } : {}),
  }));
  return contacts.every((c) => c.id && c.name && isPhone(c.phone)) ? contacts : null;
};

export async function saveDealerProfile(input: DealerFields & { email: string }): Promise<SaveResult> {
  const user = await requireUser();
  const contacts = validContacts(input?.contacts);
  const fields: DealerFields = {
    name: text(input?.name, 120),
    phone: text(input?.phone, 40),
    type: input?.type === "official" ? "official" : "used",
    brands: Array.isArray(input?.brands) ? input.brands.map((b) => text(b, 40)).filter(Boolean).slice(0, 30) : [],
    regNumber: normalizeRegNumber(text(input?.regNumber, 20)),
    description: text(input?.description, 3000),
    address: text(input?.address, 200),
    city: text(input?.city, 60),
    lat: Number(input?.lat),
    lng: Number(input?.lng),
    hours: validHours(input?.hours) ? input.hours : {},
    contacts: contacts ?? [],
    reassign: typeof input?.reassign === "object" && input.reassign ? input.reassign : {},
  };
  const valid =
    fields.name &&
    isPhone(fields.phone) &&
    isRegNumber(fields.regNumber) &&
    fields.address &&
    findPlace(fields.city) &&
    Number.isFinite(fields.lat) &&
    Number.isFinite(fields.lng) &&
    contacts !== null;
  if (!valid) return { error: "invalid" };
  if (fields.type !== "official") fields.brands = [];
  // номер другой компании — понятная ошибка вместо сбоя уникальности в базе
  if (user.dealerSlug && (await regNumberTaken(fields.regNumber, await ownDealerId(user)))) return { error: "regTaken" };

  if (!(await saveOwnDealer(user, fields))) return { error: "invalid" };
  updateTag("dealers");
  const email = await changeEmail(user, text(input.email, 200).toLowerCase());
  if (email === "invalid") return { error: "invalid" };
  return { ok: true, user: { ...user, name: fields.name, phone: fields.phone }, emailPending: email === "confirm" };
}

// Телефон компании из формы продажи — чтобы в следующий раз не вводить
export async function saveCompanyPhone(phone: string): Promise<boolean> {
  const user = await requireUser();
  const value = text(phone, 40);
  if (!isPhone(value)) return false;
  await saveOwnProfile(user, { name: user.name, phone: value, city: user.city ?? null });
  if (user.type === "dealer") {
    await saveDealerPhone(user, value);
    updateTag("dealers");
  }
  return true;
}

// Новое контактное лицо дилера из формы продажи. Возвращает его id
export async function addContact(contact: DealerContact): Promise<string | null> {
  const user = await requireUser();
  const [valid] = validContacts([{ ...contact, id: "new" }]) ?? [];
  if (!valid) return null;
  const id = await addOwnContact(user, valid);
  if (id) updateTag("dealers");
  return id;
}

// Первое объявление частного лица: телефон и место, которых ещё нет в профиле, сохраняем туда —
// в следующий раз форма подставит их сама. Заполненное раньше не перезаписываем
export async function completeProfile(input: { phone?: string; city?: string }): Promise<User | null> {
  const user = await requireUser();
  const phone = text(input?.phone, 40);
  const city = text(input?.city, 60);
  const next = {
    name: user.name,
    phone: user.phone || (isPhone(phone) ? phone : ""),
    city: user.city ?? (findPlace(city) ? city : null),
  };
  if (next.phone === user.phone && (next.city ?? undefined) === user.city) return user;
  await saveOwnProfile(user, next);
  return { ...user, phone: next.phone, city: next.city ?? undefined };
}

// «Удалить аккаунт» в настройках: подтверждение паролем, затем удаление и выход
export async function deleteAccount(password: string): Promise<{ ok: true } | { error: "invalid" }> {
  const user = await requireUser();
  if (typeof password !== "string" || !password) return { error: "invalid" };
  const supabase = await createSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email: user.email, password });
  if (error) return { error: "invalid" };

  await deleteOwnAccount(user);
  // сессия уже недействительна — только убираем cookie в браузере
  await supabase.auth.signOut({ scope: "local" });
  updateTag("listings");
  updateTag("dealers");
  return { ok: true };
}
