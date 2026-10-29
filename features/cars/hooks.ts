"use client";

// Объявления в клиентских компонентах. Счётчики приходят с сервера сразу (CatalogProvider),
// сами объявления — по запросу через Server Actions (./actions): только те, что нужны на странице
import { useCatalog } from "@/components/providers/CatalogProvider";
import { useServerData } from "@/lib/useServerData";

import {
  countSearch,
  loadLatestListings,
  loadListingsByIds,
} from "./actions";
import type { Listing, ListingStats } from "./types";

// Сколько опубликованных объявлений: всего, по маркам, моделям и подборкам
export function useListingStats(): ListingStats {
  return useCatalog().stats;
}

// В порядке ids; удалённые из базы — пропускаются (избранное, сравнение)
export function useListingsByIds(ids: string[]): Listing[] | undefined {
  const data = useServerData(ids.length ? `ids:${ids.join(",")}` : null, () => loadListingsByIds(ids));
  return ids.length ? data : [];
}

// Свежие объявления с фото — подсказки на пустых страницах
export function useLatestListings(limit: number): Listing[] | undefined {
  return useServerData(`latest:${limit}`, () => loadLatestListings(limit));
}

// Число объявлений по фильтрам (быстрый поиск на главной)
export function useSearchCount(query: Record<string, string>): number | undefined {
  const key = JSON.stringify(Object.entries(query).filter(([, v]) => v).sort());
  return useServerData(`count:${key}`, () => countSearch(query));
}
