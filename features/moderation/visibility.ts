"use client";

import type { ListingStatus } from "@/features/account/listings/status";
import type { Listing } from "@/features/cars/types";
import type { Collection } from "@/features/collections/config";
import { useDealerLookup } from "@/features/dealers/hooks";

import type { AccountBlock, Moderation } from "./types";

// Итоговое состояние объявления: решения модератора важнее статуса от продавца.
// Всё приходит с сервера в самом объявлении; правило «видно покупателям» — то же, что published в features/cars/api.ts
export type Visibility = {
  seller: ListingStatus;
  moderation?: Moderation;
  pending: boolean; // новое объявление ждёт одобрения
  accountBlock?: AccountBlock; // заблокирован весь аккаунт продавца
};

export type VisibilitySubject = Pick<Listing, "status" | "review" | "moderation" | "accountBlock">;

export const visibilityOf = (listing: VisibilitySubject): Visibility => ({
  seller: listing.status,
  moderation: listing.moderation,
  pending: listing.review === "pending",
  accountBlock: listing.accountBlock,
});

// показывается покупателям
export const isPublic = (listing: VisibilitySubject) =>
  listing.status === "active" && !listing.moderation && listing.review !== "pending" && !listing.accountBlock;

export function useVisibility() {
  return { of: visibilityOf, isPublic };
}

// Попадание в подборку: правило подборки, но модератор может «снять» с неё объявление
export const inCollection = (listing: Listing, collection: Collection) =>
  !listing.excludedCollections?.includes(collection.slug) && collection.matches(listing);

export function useCollectionMembership() {
  return inCollection;
}

// Значок «Проверенный дилер» — поле verified в базе (меняет модератор)
export function useDealerVerified() {
  const dealerOf = useDealerLookup();
  return (slug: string) => dealerOf(slug)?.verified ?? false;
}
