import type { ListingStats } from "@/features/cars/types";
import type { Dealer } from "@/features/dealers/types";

// Общие данные из базы для всех страниц (CatalogProvider): каталог дилеров и счётчики объявлений
export type Catalog = { dealers: Dealer[]; stats: ListingStats };
