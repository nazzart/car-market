import type { Dealer } from "../types";

// Дилер виден покупателям (поиск, карта, главная, sitemap, его страница), когда профиль заполнен —
// адрес и телефон — и модератор его не заблокировал. Новая компания до этого видна только себе в кабинете.
// То же правило на SQL — в searchDealers (features/dealers/api.ts)
export const isProfileComplete = (dealer: Pick<Dealer, "address" | "phone">) =>
  Boolean(dealer.address.trim() && dealer.phone.trim());

export const isListed = (dealer: Pick<Dealer, "address" | "phone" | "blocked">) =>
  isProfileComplete(dealer) && !dealer.blocked;
