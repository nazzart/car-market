"use client";

import { createContext, useContext } from "react";
import { useSearchParams } from "next/navigation";

import { usePathname, useRouter } from "@/i18n/navigation";
import { withQuery } from "@/lib/url";

import { FILTER_KEYS } from "../../config/filterOptions";

// Переход к новым результатам: CarsSearchView затемняет список, пока сервер готовит страницу
export const SearchTransitionContext = createContext<((navigate: () => void) => void) | null>(null);

// URL — единственный источник правды для фильтров поиска; результаты по нему считает сервер
export function useCarFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const startTransition = useContext(SearchTransitionContext);

  // replace + scroll: false — фильтры не засоряют историю и не прыгают наверх
  const apply = (changes: Record<string, string | null>) => {
    const href = withQuery(pathname.startsWith("/cars") ? pathname : "/cars", params, changes);
    const navigate = () => router.replace(href, { scroll: false });
    if (startTransition) startTransition(navigate);
    else navigate();
  };

  const updateFilter = (key: string, value: string | null) =>
    apply({
      [key]: value,
      // модель зависит от марки, окрестности — от места
      ...(key === "brand" ? { model: null } : {}),
      ...(key === "place" && !value ? { area: null } : {}),
      // другие фильтры или сортировка — снова с первой страницы (вид списка/плитки страницу не меняет)
      ...(key !== "view" ? { page: null } : {}),
    });

  const resetFilters = () => apply(Object.fromEntries([...FILTER_KEYS, "page"].map((key) => [key, null])));

  const activeCount = FILTER_KEYS.filter((key) => key !== "area" && params.get(key)).length;

  return {
    params,
    updateFilter,
    resetFilters,
    activeCount,
  };
}
