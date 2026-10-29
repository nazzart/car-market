"use client";

// Вошедший пользователь в браузере. Сессия — в cookie Supabase (её проверяет сервер); здесь только
// её отражение для интерфейса: шапка, кабинет, кнопки. После загрузки страницы профиль спрашиваем у сервера
import { createContext, createElement, useCallback, useContext, useEffect, useState } from "react";

import { useRouter } from "@/i18n/navigation";

import { loadCurrentUser, signOut } from "./actions";
import type { User } from "./types";

type AuthState = {
  user: User | null;
  loading: boolean; // профиль ещё не загружен — не показываем «Войдите» раньше времени
  setUser: (user: User | null) => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ user: User | null; loading: boolean }>({ user: null, loading: true });

  const refresh = useCallback(async () => {
    const user = await loadCurrentUser().catch(() => null);
    setState({ user, loading: false });
  }, []);

  // профиль — после загрузки страницы (страницы кэшируются одинаковыми для всех, без данных пользователя)
  useEffect(() => {
    let alive = true;
    loadCurrentUser()
      .catch(() => null)
      .then((user) => alive && setState({ user, loading: false }));
    return () => {
      alive = false;
    };
  }, []);

  const setUser = useCallback((user: User | null) => setState({ user, loading: false }), []);

  return createElement(AuthContext.Provider, { value: { ...state, setUser, refresh } }, children);
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth: нет AuthProvider выше по дереву");
  return { ...auth, isLoggedIn: Boolean(auth.user) };
}

// Выход: сессия удаляется на сервере, страница перерисовывается без данных пользователя
export function useLogout() {
  const { setUser } = useAuth();
  const router = useRouter();
  return async () => {
    await signOut();
    setUser(null);
    router.refresh();
  };
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
