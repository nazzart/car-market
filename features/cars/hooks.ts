"use client";

// Объявления в клиентских компонентах. Счётчики приходят с сервера сразу (CatalogProvider),
// сами объявления — по запросу через Server Actions (./actions): только те, что нужны на странице
import { useEffect, useState } from "react";

import { useCatalog } from "@/components/providers/CatalogProvider";

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

// Загрузка с сервера с общим кэшем на минуту: одни и те же данные на соседних страницах не запрашиваются дважды.
// undefined — ещё загружается; при смене key возвращает прежний результат, пока не придёт новый (без мигания)
const TTL = 60_000;
const cache = new Map<string, { at: number; promise: Promise<unknown> }>();

function useServerData<T>(key: string | null, load: () => Promise<T>): T | undefined {
  const [state, setState] = useState<{ key: string; value: T }>();

  useEffect(() => {
    if (key === null) return;
    let entry = cache.get(key);
    if (!entry || Date.now() - entry.at > TTL) {
      entry = { at: Date.now(), promise: load() };
      cache.set(key, entry);
      entry.promise.catch(() => cache.delete(key));
    }
    let alive = true;
    (entry.promise as Promise<T>).then((value) => alive && setState({ key, value }));
    return () => {
      alive = false;
    };
    // load зависит только от key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state?.value;
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
