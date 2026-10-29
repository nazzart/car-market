"use client";

import { ListingStatus, statusOf, useListingStatuses } from "@/features/account/listings/statusStore";
import { Listing } from "@/features/cars/types";
import { Collection } from "@/features/collections/config";
import { useListingLookup } from "@/features/cars/api";
import { useDealerLookup } from "@/features/dealers/api";

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

export function useVisibility() {
  const statuses = useListingStatuses();
  const moderation = useModeration();
  const approvals = useApprovals();
  const blockedAccounts = useBlockedAccounts();

  const listingById = useListingLookup();

  const of = (id: string): Visibility => {
    const listing = listingById(id);
    const owner = listing && ownerOf(listing);
    return {
      seller: statusOf(statuses, id),
      moderation: moderation[id],
      pending: listing?.review === "pending" && !approvals[id],
      accountBlock: owner ? blockedAccounts[owner] : undefined,
    };
  };

  // показывается покупателям
  const isPublic = (id: string) => {
    const v = of(id);
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
