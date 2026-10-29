"use client";

import { ListingStatus, statusOf, useListingStatuses } from "@/features/account/listings/statusStore";
import { Listing } from "@/features/cars/types";
import { Collection } from "@/features/collections/config";
import { useDealerLookup } from "@/features/dealers/hooks";

import { ownerOf } from "./accounts";
import {
  AccountBlock,
  Moderation,
  useApprovals,
  useBlockedAccounts,
  useExcluded,
  useModeration,
  useVerification,
} from "./store";

// Итоговое состояние объявления: решения модератора важнее статуса от продавца
export type Visibility = {
  seller: ListingStatus;
  moderation?: Moderation;
  pending: boolean; // новое объявление ждёт одобрения
  accountBlock?: AccountBlock; // заблокирован весь аккаунт продавца
};

// Что нужно знать об объявлении, чтобы решить, кому оно видно
export type VisibilitySubject = Pick<Listing, "id" | "review" | "dealer" | "userId">;

export function useVisibility() {
  const statuses = useListingStatuses();
  const moderation = useModeration();
  const approvals = useApprovals();
  const blockedAccounts = useBlockedAccounts();

  const of = (listing: VisibilitySubject): Visibility => {
    const owner = ownerOf(listing);
    return {
      seller: statusOf(statuses, listing.id),
      moderation: moderation[listing.id],
      pending: listing.review === "pending" && !approvals[listing.id],
      accountBlock: owner ? blockedAccounts[owner] : undefined,
    };
  };

  // показывается покупателям
  const isPublic = (listing: VisibilitySubject) => {
    const v = of(listing);
    return v.seller === "active" && !v.moderation && !v.pending && !v.accountBlock;
  };

  return { of, isPublic };
}

// Попадание в подборку: правило подборки, но модератор может «снять» с неё объявление
export function useCollectionMembership() {
  const excluded = useExcluded();

  return (listing: Listing, collection: Collection) => {
    if (excluded[listing.id]?.includes(collection.slug)) return false;
    return collection.matches(listing);
  };
}

// Значок «Проверенный дилер»: решение модератора поверх данных
export function useDealerVerified() {
  const overrides = useVerification();
  const dealerOf = useDealerLookup();
  return (slug: string) => overrides[slug] ?? dealerOf(slug)?.verified ?? false;
}
