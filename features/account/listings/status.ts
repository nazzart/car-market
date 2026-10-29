// Статус объявления, который меняет продавец в кабинете (колонка listings.status)
export type ListingStatus = "active" | "paused" | "sold" | "deleted";
export const LISTING_STATUSES: ListingStatus[] = ["active", "paused", "sold", "deleted"];
