"use client";

import { useMemo, useSyncExternalStore } from "react";

import { User } from "./data/demoUsers";

// Демо-авторизация: пользователь хранится в localStorage, поэтому переживает перезагрузку.
// Позже заменим на сессию Auth.js / Supabase — компоненты используют только useAuth()

const STORAGE_KEY = "bestauto.demoUser";
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener("storage", listener); // вход/выход в другой вкладке

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

export function login(user: User) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // localStorage недоступен (приватный режим) — демо-вход не сохранится
  }
  notify();
}

export function logout() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // нечего удалять
  }
  notify();
}

export function useAuth() {
  // на сервере пользователя нет — после гидратации подхватится из localStorage
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const user = useMemo<User | null>(() => {
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [raw]);

  return { user, isLoggedIn: Boolean(user) };
}

// Открыть окно входа с любой страницы (например, «Войдите, чтобы открыть кабинет»)
const OPEN_EVENT = "bestauto:open-auth";

export function openAuthModal() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenAuthModal(handler: () => void) {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}
