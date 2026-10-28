import { demoUsers } from "@/features/auth/data/demoUsers";
import type { Listing } from "@/features/cars/data/listings";

// Ключ аккаунта продавца объявления: дилер или зарегистрированный пользователь.
// У части демо-объявлений частных лиц аккаунта нет — тогда null
export function ownerOf(listing: Listing): string | null {
  if (listing.dealer) return `dealer:${listing.dealer}`;
  const user = demoUsers.find((u) => u.listingIds?.includes(listing.id));
  return user ? `user:${user.id}` : null;
}

export const accountOfUser = (user: { id: string; type: string; dealerSlug?: string }) =>
  user.type === "dealer" && user.dealerSlug ? `dealer:${user.dealerSlug}` : `user:${user.id}`;
