"use client";

import { useSearchParams } from "next/navigation";

import { usePathname, useRouter } from "@/i18n/navigation";

import { FILTER_KEYS } from "../../config/filterOptions";

// URL — единственный источник правды для фильтров поиска
export function useCarFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const apply = (newParams: URLSearchParams) => {
    const query = newParams.toString();
    const base = pathname.startsWith("/cars") ? pathname : "/cars";

    // replace + scroll: false — фильтры не засоряют историю и не прыгают наверх
    router.replace(query ? `${base}?${query}` : base, { scroll: false });
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

    apply(newParams);
  };

  const resetFilters = () => {
    const newParams = new URLSearchParams(params.toString());

    for (const key of FILTER_KEYS) newParams.delete(key);

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
