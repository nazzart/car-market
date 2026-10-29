"use server";

// Избранное: Server Actions — только для вошедших, каждый работает со своим списком
import { requireUser } from "@/features/auth/api";
import { parseListingId } from "@/lib/validate";

import * as favorites from "./api";
import type { FavoriteEntry } from "./types";

export async function loadFavorites(): Promise<FavoriteEntry[]> {
  return favorites.listFavorites(await requireUser());
}

export async function addFavorite(id: string, restore?: { price: number; addedAt: number }) {
  const valid =
    restore && Number.isInteger(restore.price) && restore.price >= 0 && Number.isFinite(restore.addedAt) ? restore : undefined;
  await favorites.addFavorite(await requireUser(), parseListingId(id), valid);
}

export async function removeFavorite(id: string) {
  await favorites.removeFavorite(await requireUser(), parseListingId(id));
}

export async function clearFavorites() {
  await favorites.clearFavorites(await requireUser());
}
