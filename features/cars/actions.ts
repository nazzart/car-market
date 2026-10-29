"use server";

// Server Actions: так клиентские компоненты запрашивают объявления у сервера (избранное, сравнение, кабинеты).
// Каждая функция — публичная точка входа, поэтому входные данные проверяются здесь
import {
  countListings,
  getAllListings,
  getDealerListings,
  getLatestListings,
  getListingsByIds,
  getUserListings,
} from "./api";
import type { Listing } from "./types";

const strings = (value: unknown, max: number): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string").slice(0, max) : [];

export async function loadListingsByIds(ids: string[]): Promise<Listing[]> {
  return getListingsByIds(strings(ids, 200));
}

export async function loadLatestListings(limit: number): Promise<Listing[]> {
  return getLatestListings(Math.min(Math.max(1, Math.floor(limit) || 1), 24), { withPhotos: true });
}

// TODO(auth): отдавать только объявления вошедшего пользователя (сейчас вход демо — в браузере)
export async function loadOwnerListings(owner: { dealer?: string; userId?: string }): Promise<Listing[]> {
  if (typeof owner?.dealer === "string") return getDealerListings(owner.dealer);
  if (typeof owner?.userId === "string") return getUserListings(owner.userId);
  return [];
}

// TODO(auth): только для модератора — проверка роли на сервере
export async function loadAllListings(): Promise<Listing[]> {
  return getAllListings();
}

// Число объявлений для кнопки «Показать N» в быстром поиске на главной — по тем же правилам, что /cars
export async function countSearch(query: Record<string, string>): Promise<number> {
  const safe = typeof query === "object" && query ? query : {};
  return countListings({ get: (key) => (typeof safe[key] === "string" && safe[key]) || null });
}
