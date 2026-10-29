import type { User } from "@/features/auth/types";
import type { Listing } from "@/features/cars/types";

// Ключ аккаунта продавца: "dealer:<slug>" или "user:<id>". Модерация (блокировки, жалобы) ведётся по этим ключам
export type AccountKey = `dealer:${string}` | `user:${string}`;

export const dealerAccount = (slug: string): AccountKey => `dealer:${slug}`;
export const userAccount = (id: string): AccountKey => `user:${id}`;

// Аккаунт продавца объявления. У части демо-объявлений частных лиц аккаунта нет — тогда null
export function ownerOf(listing: Listing): AccountKey | null {
  if (listing.dealer) return dealerAccount(listing.dealer);
  return listing.userId ? userAccount(listing.userId) : null;
}

export const accountOfUser = (user: Pick<User, "id" | "type" | "dealerSlug">): AccountKey =>
  user.type === "dealer" && user.dealerSlug ? dealerAccount(user.dealerSlug) : userAccount(user.id);
