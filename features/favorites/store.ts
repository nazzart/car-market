"use client";

import { useMemo } from "react";

import { createLocalStore } from "@/lib/localStore";

// Избранное работает и без входа (как на avito): хранится в localStorage.
// TODO: после входа синхронизировать с профилем пользователя через API

export type FavoriteEntry = {
  id: string;
  addedAt: number; // timestamp
  price: number; // цена на момент добавления — чтобы показать, если она снизилась
};

const store = createLocalStore<FavoriteEntry[]>("bestauto.favorites", []);

export function addFavorite(entry: FavoriteEntry) {
  store.set([entry, ...store.get().filter((e) => e.id !== entry.id)]);
}

export function removeFavorite(id: string) {
  store.set(store.get().filter((e) => e.id !== id));
}

export function toggleFavorite(listing: { id: string; price: number }) {
  if (store.get().some((e) => e.id === listing.id)) removeFavorite(listing.id);
  else addFavorite({ id: listing.id, price: listing.price, addedAt: Date.now() });
}

export function clearFavorites() {
  store.set([]);
}

// На сервере избранного нет — список подхватится после гидратации
export function useFavorites() {
  const entries = store.useValue();
  const ids = useMemo(() => new Set(entries.map((e) => e.id)), [entries]);

  return { entries, ids, count: entries.length };
}

export function useIsFavorite(id: string) {
  return useFavorites().ids.has(id);
}
