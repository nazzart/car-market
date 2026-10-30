import { Listing } from "@/features/cars/types";

// Автоматические проверки нового объявления — подсказки модератору, не решение
export type RiskFlag = "contactInText" | "priceLow" | "newSeller" | "noPhotos" | "duplicate";

// латвийский мобильный — 8 цифр с «2» в начале, с пробелами или дефисами где угодно («2000 1234», «20 001 234»)
const CONTACT = /(\+?371[\s-]?)?\b2(?:[\s-]?\d){7}\b|https?:\/\/|www\.|[\w.-]+@[\w-]+\.\w+|whatsapp|telegram/i;

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

// all — объявления для сравнения цены и поиска дублей. TODO(admin): считать на сервере при подаче
export function riskFlags(listing: Listing, all: Listing[]): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const thisYear = new Date().getFullYear();

  // контакты в описании или версии (она попадает в заголовок) — частый признак мошенничества (увод общения с сайта)
  if (CONTACT.test([listing.description, listing.version].filter(Boolean).join(" "))) flags.push("contactInText");

  // цена сильно ниже похожих (тот же кузов, ±3 года) или подозрительно низкая для свежего авто
  const similar = all.filter(
    (l) => l.id !== listing.id && l.bodyType === listing.bodyType && Math.abs(l.year - listing.year) <= 3
  );
  const tooCheapVsSimilar = similar.length >= 2 && listing.price < median(similar.map((l) => l.price)) * 0.5;
  const tooCheapForAge = listing.year >= thisYear - 8 && listing.price < 8000;
  if (tooCheapVsSimilar || tooCheapForAge) flags.push("priceLow");

  if (listing.sellerType === "private" && (!listing.sellerSince || listing.sellerSince >= thisYear)) flags.push("newSeller");
  if (listing.images.length === 0) flags.push("noPhotos");

  const duplicate = all.some(
    (l) => l.id !== listing.id && l.title === listing.title && l.price === listing.price && l.year === listing.year
  );
  if (duplicate) flags.push("duplicate");

  return flags;
}
