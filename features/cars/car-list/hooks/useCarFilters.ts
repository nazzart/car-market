"use client";

import { createContext, useContext } from "react";
import { useSearchParams } from "next/navigation";

import { usePathname, useRouter } from "@/i18n/navigation";

import { FILTER_KEYS } from "../../config/filterOptions";

// Переход к новым результатам: CarsSearchView затемняет список, пока сервер готовит страницу
export const SearchTransitionContext = createContext<((navigate: () => void) => void) | null>(null);

// URL — единственный источник правды для фильтров поиска; результаты по нему считает сервер
export function useCarFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const startTransition = useContext(SearchTransitionContext);

  const apply = (newParams: URLSearchParams) => {
    const query = newParams.toString();
    const base = pathname.startsWith("/cars") ? pathname : "/cars";

    // replace + scroll: false — фильтры не засоряют историю и не прыгают наверх
    const navigate = () => router.replace(query ? `${base}?${query}` : base, { scroll: false });
    if (startTransition) startTransition(navigate);
    else navigate();
  };

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(params.toString());

    if (!value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }

    // модель зависит от марки, окрестности — от места
    if (key === "brand") newParams.delete("model");
    if (key === "place" && !value) newParams.delete("area");
    // другие фильтры или сортировка — снова с первой страницы (вид списка/плитки страницу не меняет)
    if (key !== "view") newParams.delete("page");

    apply(newParams);
  };

  const resetFilters = () => {
    const newParams = new URLSearchParams(params.toString());

    for (const key of FILTER_KEYS) newParams.delete(key);
    newParams.delete("page");

    apply(newParams);
  };

  const activeCount = FILTER_KEYS.filter((key) => key !== "area" && params.get(key)).length;

  return {
    params,
    updateFilter,
    resetFilters,
    activeCount,
  };
}
