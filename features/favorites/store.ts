"use client";

// Избранное — только для вошедших, хранится в базе. Здесь — его копия в браузере для мгновенного отклика:
// сердечко меняется сразу, запрос уходит на сервер; при ошибке список перечитывается.
// Гостю вместо добавления — окно входа
import { useEffect, useMemo, useSyncExternalStore } from "react";

import { openAuthModal, useAuth } from "@/features/auth/store";

import * as actions from "./actions";
import type { FavoriteEntry } from "./types";


let entries: FavoriteEntry[] = [];
let loggedIn = false;
let ready = false; // список вошедшего пользователя загружен
const listeners = new Set<() => void>();
const set = (next: FavoriteEntry[]) => {
  entries = next;
  listeners.forEach((l) => l());
};

const reload = () =>
  actions.loadFavorites().then(
    (list) => ((ready = true), set(list)),
    () => ((ready = true), set([]))
  );
// изменение на сервере не прошло — возвращаем список как на сервере
const send = (request: Promise<void>) => request.catch(reload);

// Загружает избранное вошедшего пользователя и очищает при выходе. Один раз — в app/[locale]/layout.tsx
export function FavoritesSync() {
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    loggedIn = Boolean(userId);
    ready = false;
    if (userId) reload();
    else set([]);
  }, [userId]);

  return null;
}

export function addFavorite(entry: FavoriteEntry) {
  set([entry, ...entries.filter((e) => e.id !== entry.id)]);
  send(actions.addFavorite(entry.id, { price: entry.price, addedAt: entry.addedAt }));
}

export function removeFavorite(id: string) {
  set(entries.filter((e) => e.id !== id));
  send(actions.removeFavorite(id));
}

export function toggleFavorite(listing: { id: string; price: number }) {
  if (!loggedIn) return openAuthModal();
  if (entries.some((e) => e.id === listing.id)) return removeFavorite(listing.id);
  set([{ id: listing.id, price: listing.price, addedAt: Date.now() }, ...entries]);
  send(actions.addFavorite(listing.id));
}

export function clearFavorites() {
  set([]);
  send(actions.clearFavorites());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const empty: FavoriteEntry[] = [];

export function useFavorites() {
  const list = useSyncExternalStore(subscribe, () => entries, () => empty);
  const ids = useMemo(() => new Set(list.map((e) => e.id)), [list]);
  return { entries: list, ids, count: list.length, ready: ready || !loggedIn };
}

export function useIsFavorite(id: string) {
  return useFavorites().ids.has(id);
}
