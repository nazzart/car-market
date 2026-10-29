import type { ListingStats } from "@/features/cars/types";
import type { DealerSummary } from "@/features/dealers/types";

// Общие данные из базы для всех страниц (CatalogProvider): названия дилеров и счётчики объявлений.
// Видны любому посетителю в коде страницы — только публичное
export type Catalog = { dealers: DealerSummary[]; stats: ListingStats };
