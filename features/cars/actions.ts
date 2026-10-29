"use server";

// Server Actions: так клиентские компоненты запрашивают объявления у сервера (избранное, сравнение, кабинеты).
// Каждая функция — публичная точка входа, поэтому входные данные проверяются здесь
import { countListings, getLatestListings, getListingsByIds } from "./api";
import type { Listing } from "./types";

const strings = (value: unknown, max: number): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string").slice(0, max) : [];

// Избранное и сравнение. Объявления на проверке посторонним не отдаём
export async function loadListingsByIds(ids: string[]): Promise<Listing[]> {
  return (await getListingsByIds(strings(ids, 200))).filter((l) => l.review !== "pending");
}

export async function loadLatestListings(limit: number): Promise<Listing[]> {
  return getLatestListings(Math.min(Math.max(1, Math.floor(limit) || 1), 24), { withPhotos: true });
}

// Число объявлений для кнопки «Показать N» в быстром поиске на главной — по тем же правилам, что /cars
export async function countSearch(query: Record<string, string>): Promise<number> {
  const safe = typeof query === "object" && query ? query : {};
  return countListings({ get: (key) => (typeof safe[key] === "string" && safe[key]) || null });
}
