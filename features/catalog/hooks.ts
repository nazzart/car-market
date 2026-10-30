"use client";

import { useCatalog } from "@/components/providers/CatalogProvider";
import { useServerData } from "@/lib/useServerData";

import { loadBrandModels } from "./actions";
import type { Brand, CatalogModel } from "./types";

// Марки — из CatalogProvider (загружены в app/[locale]/layout.tsx), по алфавиту
export function useBrands(): Brand[] {
  return useCatalog().brands;
}

// slug → название («bmw» → «BMW»); неизвестная марка — сам slug
export function useBrandName(): (slug: string) => string {
  const brands = useBrands();
  return (slug) => brands.find((b) => b.slug === slug)?.name ?? slug;
}

// Модели марки с версиями. undefined — ещё загружаются; без марки — пустой список.
// initial — уже загруженные сервером (страница /cars), чтобы не ждать
export function useBrandModels(brand: string, initial?: CatalogModel[]): CatalogModel[] | undefined {
  const loaded = useServerData(brand ? `catalog:${brand}` : null, () => loadBrandModels(brand), { ttl: 10 * 60_000, keepPrevious: false });
  if (!brand) return [];
  return loaded ?? initial;
}
