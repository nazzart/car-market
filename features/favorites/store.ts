"use client";

import { useMemo, useSyncExternalStore } from "react";

// Избранное работает и без входа (как на avito): хранится в localStorage.
// TODO: после входа синхронизировать с профилем пользователя через API

export type FavoriteEntry = {
  id: string;
  addedAt: number; // timestamp
  price: number; // цена на момент добавления — чтобы показать, если она снизилась
};

const STORAGE_KEY = "bestauto.favorites";
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener("storage", listener); // изменения в другой вкладке

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};

const getSnapshot = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const parse = (raw: string | null): FavoriteEntry[] => {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const write = (entries: FavoriteEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage недоступен (приватный режим) — избранное не сохранится
  }
  notify();
};

const read = () => parse(getSnapshot());

export function addFavorite(entry: FavoriteEntry) {
  write([entry, ...read().filter((e) => e.id !== entry.id)]);
}

export function removeFavorite(id: string) {
  write(read().filter((e) => e.id !== id));
}

export function toggleFavorite(listing: { id: string; price: number }) {
  if (read().some((e) => e.id === listing.id)) removeFavorite(listing.id);
  else addFavorite({ id: listing.id, price: listing.price, addedAt: Date.now() });
}

export function clearFavorites() {
  write([]);
}

// На сервере избранного нет — список подхватится после гидратации
export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const entries = useMemo(() => parse(raw), [raw]);
  const ids = useMemo(() => new Set(entries.map((e) => e.id)), [entries]);

  return { entries, ids, count: entries.length };
}

export function useIsFavorite(id: string) {
  return useFavorites().ids.has(id);
}
