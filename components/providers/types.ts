import type { ListingStats } from "@/features/cars/types";

// Общие данные из базы для всех страниц (CatalogProvider): счётчики объявлений — шапка, поиск на главной, фильтры.
// Всё остальное (дилеры, объявления) страница загружает сама — только то, что показывает
export type Catalog = { stats: ListingStats };
