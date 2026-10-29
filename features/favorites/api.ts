// Избранное на сервере: только своё (пользователь уже проверен в ./actions)
import "server-only";

import { and, desc, eq } from "drizzle-orm";

import type { User } from "@/features/auth/types";
import { db, schema } from "@/lib/db";

import type { FavoriteEntry } from "./types";

const { favorites, listings } = schema;

export async function listFavorites(user: User): Promise<FavoriteEntry[]> {
  const rows = await db
    .select({ id: favorites.listingId, price: favorites.price, createdAt: favorites.createdAt })
    .from(favorites)
    .where(eq(favorites.userId, user.id))
    .orderBy(desc(favorites.createdAt));
  return rows.map((r) => ({ id: String(r.id), price: r.price, addedAt: r.createdAt.getTime() }));
}

// Цена на момент добавления берётся из объявления; при «Отменить» после удаления — прежние цена и время
export async function addFavorite(user: User, listingId: number, restore?: { price: number; addedAt: number }) {
  const [listing] = await db.select({ price: listings.price }).from(listings).where(eq(listings.id, listingId));
  if (!listing) return;
  await db
    .insert(favorites)
    .values({
      userId: user.id,
      listingId,
      price: restore?.price ?? listing.price,
      ...(restore ? { createdAt: new Date(restore.addedAt) } : {}),
    })
    .onConflictDoNothing();
}

export async function removeFavorite(user: User, listingId: number) {
  await db.delete(favorites).where(and(eq(favorites.userId, user.id), eq(favorites.listingId, listingId)));
}

export async function clearFavorites(user: User) {
  await db.delete(favorites).where(eq(favorites.userId, user.id));
}
