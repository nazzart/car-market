"use client";

import { createContext, useContext } from "react";

import type { Catalog } from "./types";

// Счётчики объявлений и марки, загруженные сервером в app/[locale]/layout.tsx, — нужны почти на каждой странице.
// Читаются через useListingStats (features/cars/hooks) и useBrands (features/catalog/hooks), не напрямую
const CatalogContext = createContext<Catalog | null>(null);

type CatalogProviderProps = Catalog & { children: React.ReactNode };

export function CatalogProvider({ stats, brands, children }: CatalogProviderProps) {
  return <CatalogContext.Provider value={{ stats, brands }}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): Catalog {
  const catalog = useContext(CatalogContext);
  if (!catalog) throw new Error("useCatalog: нет CatalogProvider выше по дереву");
  return catalog;
}
