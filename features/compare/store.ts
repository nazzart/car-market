"use client";

import { createLocalStore } from "@/lib/localStore";

// Список сравнения: id объявлений в порядке добавления, хранится в браузере
export const MAX_COMPARE = 4;

const store = createLocalStore<string[]>("bestauto.compare", []);

// false — список уже полон
export function addToCompare(id: string) {
  const ids = store.get();
  if (ids.includes(id)) return true;
  if (ids.length >= MAX_COMPARE) return false;
  store.set([...ids, id]);
  return true;
}

export function removeFromCompare(id: string) {
  store.set(store.get().filter((x) => x !== id));
}

export function clearCompare() {
  store.set([]);
}

export const useCompare = store.useValue;

// Сообщение «список полон» показывает CompareBar — так его видно с любой страницы
const FULL_EVENT = "bestauto:compare-full";

export function toggleCompare(id: string) {
  if (store.get().includes(id)) return removeFromCompare(id);
  if (!addToCompare(id)) window.dispatchEvent(new Event(FULL_EVENT));
}

export function onCompareFull(handler: () => void) {
  window.addEventListener(FULL_EVENT, handler);
  return () => window.removeEventListener(FULL_EVENT, handler);
}
