import type { ListingStats } from "@/features/cars/types";
import type { Brand } from "@/features/catalog/types";

// Общие данные из базы для всех страниц (CatalogProvider): счётчики объявлений — шапка, поиск на главной, фильтры;
// марки (около 80, ~4 КБ) — списки и названия почти везде. Модели — по марке (features/catalog/hooks.ts).
// Всё остальное (дилеры, объявления) страница загружает сама — только то, что показывает
export type Catalog = { stats: ListingStats; brands: Brand[] };
