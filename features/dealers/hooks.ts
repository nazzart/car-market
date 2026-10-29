"use client";

// Дилеры в клиентских компонентах: только название и значок «Проверенный» (getDealerSummaries в
// app/[locale]/layout.tsx, через CatalogProvider). Полные данные — у страниц на сервере, в кабинете и модерации
import { useMemo } from "react";

import { useCatalog } from "@/components/providers/CatalogProvider";

import type { DealerSummary } from "./types";

export function useDealerLookup(): (slug: string | null | undefined) => DealerSummary | undefined {
  const { dealers } = useCatalog();
  return useMemo(() => {
    const bySlug = new Map(dealers.map((d) => [d.slug, d]));
    return (slug: string | null | undefined) => (slug ? bySlug.get(slug) : undefined);
  }, [dealers]);
}
