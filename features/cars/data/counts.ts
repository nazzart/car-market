import { listings } from "./listings";

// Счётчики по реальным объявлениям, чтобы цифры на главной совпадали с поиском.
// TODO: заменить на агрегаты из БД
const byBrand = listings.reduce<Record<string, number>>((acc, l) => {
  acc[l.brand] = (acc[l.brand] ?? 0) + 1;
  return acc;
}, {});

export const brandListingCount = (slug: string) => byBrand[slug] ?? 0;

export const totalListingCount = listings.length;
