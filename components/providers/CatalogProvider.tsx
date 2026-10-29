"use client";

import { createContext, useContext } from "react";

import type { Catalog } from "./types";

// Небольшие общие данные из базы, загруженные сервером в app/[locale]/layout.tsx: названия дилеров
// и счётчики объявлений. Сами объявления сюда не входят — их загружают страницы и хуки features/cars/hooks.
// Читаются через хуки features/cars/hooks и features/dealers/hooks, не напрямую
const CatalogContext = createContext<Catalog | null>(null);

type CatalogProviderProps = Catalog & { children: React.ReactNode };

export function CatalogProvider({ dealers, stats, children }: CatalogProviderProps) {
  return <CatalogContext.Provider value={{ dealers, stats }}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): Catalog {
  const catalog = useContext(CatalogContext);
  if (!catalog) throw new Error("useCatalog: нет CatalogProvider выше по дереву");
  return catalog;
}
