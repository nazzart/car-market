"use client";

import { useMemo, useSyncExternalStore } from "react";

// Небольшое хранилище в localStorage с подпиской для React (избранное, сравнение).
// На сервере значения нет — useValue() отдаёт fallback до гидратации
export function createLocalStore<T>(key: string, fallback: T) {
  const listeners = new Set<() => void>();

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    window.addEventListener("storage", listener); // изменения в другой вкладке

    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", listener);
    };
  };

  const getRaw = () => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const parse = (raw: string | null): T => {
    if (!raw) return fallback;
    try {
      const value = JSON.parse(raw);
      // защита от испорченных данных: ждём массив — получаем массив
      return Array.isArray(fallback) && !Array.isArray(value) ? fallback : (value as T);
    } catch {
      return fallback;
    }
  };

  const get = () => parse(getRaw());

  const set = (value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage недоступен (приватный режим) — значение не сохранится
    }
    listeners.forEach((listener) => listener());
  };

  const useValue = () => {
    const raw = useSyncExternalStore(subscribe, getRaw, () => null);
    return useMemo(() => parse(raw), [raw]);
  };

  return { get, set, useValue };
}
