"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function useCarFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(params.toString());

    if (!value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }

    router.push(`/cars?${newParams.toString()}`);
  };

  return {
    params,
    updateFilter,
  };
}
