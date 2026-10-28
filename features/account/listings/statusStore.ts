"use client";

import { createLocalStore } from "@/lib/localStore";

// Статус объявления, изменённый продавцом в кабинете. Нет записи — объявление активно.
// TODO: хранить статус в БД; сейчас (демо) — в браузере
export type ListingStatus = "active" | "paused" | "sold" | "deleted";

const store = createLocalStore<Record<string, ListingStatus>>("bestauto.listingStatus", {});

export function setListingStatus(id: string, status: ListingStatus) {
  const next = { ...store.get() };
  if (status === "active") delete next[id];
  else next[id] = status;
  store.set(next);
}

export const useListingStatuses = store.useValue;

export const statusOf = (statuses: Record<string, ListingStatus>, id: string): ListingStatus =>
  statuses[id] ?? "active";
