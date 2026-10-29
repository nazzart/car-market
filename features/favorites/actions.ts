"use server";

// Избранное: Server Actions — только для вошедших, каждый работает со своим списком
import { requireUser } from "@/features/auth/api";

import * as favorites from "./api";
import type { FavoriteEntry } from "./types";

const listingId = (id: unknown) => {
  if (typeof id !== "string" || !/^\d{1,15}$/.test(id)) throw new Error("Неверный номер объявления");
  return Number(id);
};

export async function loadFavorites(): Promise<FavoriteEntry[]> {
  return favorites.listFavorites(await requireUser());
}

export async function addFavorite(id: string, restore?: { price: number; addedAt: number }) {
  const valid =
    restore && Number.isInteger(restore.price) && restore.price >= 0 && Number.isFinite(restore.addedAt) ? restore : undefined;
  await favorites.addFavorite(await requireUser(), listingId(id), valid);
}

export async function removeFavorite(id: string) {
  await favorites.removeFavorite(await requireUser(), listingId(id));
}

export async function clearFavorites() {
  await favorites.clearFavorites(await requireUser());
}
