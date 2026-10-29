// Единственная точка доступа к объявлениям: компоненты и страницы не импортируют data/ напрямую.
// Сейчас — демо-массив; TODO(backend): заменить тела функций на запросы к БД/API, интерфейс оставить
import type { Collection } from "@/features/collections/config";

import { listings } from "./data/listings";
import { filterListings, type Params } from "./lib/filterListings";
import type { Listing } from "./types";

const findById = (id: string) => listings.find((l) => l.id === id);
// новое объявление на проверке не видно покупателям, пока модератор не одобрит
const published = () => listings.filter((l) => l.review !== "pending");

/* ---------- Сервер: страницы, метаданные, sitemap ---------- */

export async function getListing(id: string): Promise<Listing | undefined> {
  return findById(id);
}

export async function getPublishedListings(): Promise<Listing[]> {
  return published();
}

export async function getDealerListings(slug: string): Promise<Listing[]> {
  return listings.filter((l) => l.dealer === slug);
}

// Счётчики для главной: всего и по маркам — совпадают с поиском
export type ListingCounts = { total: number; byBrand: (slug: string) => number };

function counts(): ListingCounts {
  const list = published();
  const byBrand = list.reduce<Record<string, number>>((acc, l) => {
    acc[l.brand] = (acc[l.brand] ?? 0) + 1;
    return acc;
  }, {});
  return { total: list.length, byBrand: (slug) => byBrand[slug] ?? 0 };
}

export async function getListingCounts(): Promise<ListingCounts> {
  return counts();
}

export async function countListings(params: Params): Promise<number> {
  return filterListings(published(), params).length;
}

/* ---------- Клиент: хуки. TODO(backend): запрос с кэшем (SWR / React Query) с тем же результатом ---------- */

// Все объявления, включая скрытые: поиск и кабинеты сами решают, что показывать (moderation/visibility)
export function useListings(): Listing[] {
  return listings;
}

export function useListingLookup(): (id: string) => Listing | undefined {
  return findById;
}

// В порядке ids; удалённые из базы — пропускаются
export function useListingsByIds(ids: string[]): Listing[] {
  return ids.map(findById).filter((l) => l !== undefined);
}

export function useDealerListingsOf(slug: string | undefined): Listing[] {
  return slug ? listings.filter((l) => l.dealer === slug) : [];
}

// Сколько опубликованных объявлений попадает в подборку (по её правилу)
export function useCollectionCount(): (collection: Collection) => number {
  return (collection) => published().filter(collection.matches).length;
}

export function useListingCounts(): ListingCounts {
  return counts();
}

export function useUserListings(userId: string | undefined): Listing[] {
  return userId ? listings.filter((l) => l.userId === userId) : [];
}
