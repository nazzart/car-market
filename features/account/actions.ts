"use server";

// Кабинет: Server Actions. Сначала — кто вошёл (requireUser), затем проверка ввода, затем запись в базу
// и updateTag — страницы с этими данными сразу показывают новое
import { updateTag } from "next/cache";

import { requireUser } from "@/features/auth/api";
import type { User } from "@/features/auth/types";
import { getDealerListings, getUserListings } from "@/features/cars/api";
import type { Listing } from "@/features/cars/types";
import { DAYS, type DealerContact, type OpeningHours } from "@/features/dealers/types";
import { isPhone } from "@/lib/phone";
import { findPlace } from "@/lib/places";
import { createSupabase } from "@/lib/supabase/server";

import {
  type DealerFields,
  addOwnContact,
  assignOwnContact,
  saveDealerPhone,
  saveOwnDealer,
  saveOwnProfile,
  setOwnListingStatus,
} from "./api";
import { LISTING_STATUSES, type ListingStatus } from "./listings/status";

const text = (value: unknown, max = 200) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const listingId = (id: unknown) => (typeof id === "string" && /^\d{1,15}$/.test(id) ? Number(id) : null);

// Объявления вошедшего: у дилера — его компании, у частного лица — свои (включая скрытые и проданные)
export async function loadOwnListings(): Promise<Listing[]> {
  const user = await requireUser();
  return user.type === "dealer" && user.dealerSlug ? getDealerListings(user.dealerSlug) : getUserListings(user.id);
}

export async function setListingStatus(id: string, status: ListingStatus): Promise<boolean> {
  const user = await requireUser();
  const numeric = listingId(id);
  if (numeric === null || !LISTING_STATUSES.includes(status)) return false;
  const ok = await setOwnListingStatus(user, numeric, status);
  if (ok) updateTag("listings");
  return ok;
}

// contactId "company" — основной телефон дилера
export async function assignContact(ids: string[], contactId: string): Promise<boolean> {
  const user = await requireUser();
  const numbers = (Array.isArray(ids) ? ids : []).map(listingId).filter((n) => n !== null).slice(0, 500);
  if (!numbers.length) return false;
  const ok = await assignOwnContact(user, numbers, contactId === "company" ? null : text(contactId, 80));
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

export type SaveResult = { ok: true; user: User; emailPending?: boolean } | { error: "invalid" };

export async function saveProfile(input: { name: string; email: string; phone: string; city: string }): Promise<SaveResult> {
  const user = await requireUser();
  const fields = { name: text(input?.name, 120), phone: text(input?.phone, 40), city: text(input?.city, 60) };
  if (!fields.name || !isPhone(fields.phone) || !findPlace(fields.city)) return { error: "invalid" };

  await saveOwnProfile(user, fields);
  const email = await changeEmail(user, text(input.email, 200).toLowerCase());
  if (email === "invalid") return { error: "invalid" };
  return { ok: true, user: { ...user, ...fields }, emailPending: email === "confirm" };
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
    regNumber: text(input?.regNumber, 20).replace(/\s/g, ""),
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
    /^\d{11}$/.test(fields.regNumber) &&
    fields.address &&
    findPlace(fields.city) &&
    Number.isFinite(fields.lat) &&
    Number.isFinite(fields.lng) &&
    contacts !== null;
  if (!valid) return { error: "invalid" };
  if (fields.type !== "official") fields.brands = [];

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
  await saveOwnProfile(user, { name: user.name, phone: value, city: user.city });
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
