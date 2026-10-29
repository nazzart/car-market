"use client";

import { createContext, useContext } from "react";

import type { ListingStats } from "@/features/cars/types";
import type { Dealer } from "@/features/dealers/types";

// Небольшие общие данные из базы, загруженные сервером в app/[locale]/layout.tsx: каталог дилеров (сотни записей)
// и счётчики объявлений. Сами объявления сюда не входят — их загружают страницы и хуки features/cars/hooks.
// Читаются через хуки features/cars/hooks и features/dealers/hooks, не напрямую
type Catalog = { dealers: Dealer[]; stats: ListingStats };

const CatalogContext = createContext<Catalog | null>(null);

export function CatalogProvider({ dealers, stats, children }: Catalog & { children: React.ReactNode }) {
  return <CatalogContext.Provider value={{ dealers, stats }}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): Catalog {
  const catalog = useContext(CatalogContext);
  if (!catalog) throw new Error("useCatalog: нет CatalogProvider выше по дереву");
  return catalog;
}
