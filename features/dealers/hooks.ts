"use client";

// Дилеры в клиентских компонентах. Данные загружает сервер (getDealers в app/[locale]/layout.tsx)
// и передаёт через CatalogProvider
import { useMemo } from "react";

import { useCatalog } from "@/components/providers/CatalogProvider";

import type { Dealer } from "./types";

// Весь каталог, включая заблокированных (модерация)
export function useDealerCatalog(): Dealer[] {
  return useCatalog().dealers;
}

export function useDealerLookup(): (slug: string | null | undefined) => Dealer | undefined {
  const dealers = useDealerCatalog();
  return useMemo(() => {
    const bySlug = new Map(dealers.map((d) => [d.slug, d]));
    return (slug: string | null | undefined) => (slug ? bySlug.get(slug) : undefined);
  }, [dealers]);
}
