export type FavoriteEntry = {
  id: string; // id объявления
  addedAt: number; // timestamp
  price: number; // цена на момент добавления — чтобы показать, если она снизилась
};
