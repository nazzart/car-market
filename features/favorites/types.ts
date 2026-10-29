export type FavoriteEntry = {
  id: string; // id объявления
  addedAt: number; // timestamp
  price: number; // цена на момент добавления — чтобы показать, если она снизилась
};

// Сортировка на странице избранного
export const FAVORITE_SORTS = ["added", "price_asc", "price_desc"] as const;
export type FavoriteSort = (typeof FAVORITE_SORTS)[number];
