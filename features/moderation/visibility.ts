"use client";

import { ListingStatus, statusOf, useListingStatuses } from "@/features/account/listings/statusStore";
import { Listing, listings } from "@/features/cars/data/listings";
import { Collection } from "@/features/collections/data/collections";
import { dealers } from "@/features/dealers/data/dealers";

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

  const listingById = (id: string) => listings.find((l) => l.id === id);

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
  return (slug: string) => overrides[slug] ?? dealers.find((d) => d.slug === slug)?.verified ?? false;
}
