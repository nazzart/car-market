"use client";

import { createLocalStore } from "@/lib/localStore";

import type { DealerProfile, User } from "./types";

// Демо-авторизация: пользователь хранится в localStorage, поэтому переживает перезагрузку.
// TODO(backend): сессия Auth.js / Supabase — компоненты используют только функции этого файла
const session = createLocalStore<User | null>("bestauto.demoUser", null);

export function login(user: User) {
  session.set(user);
}

export function logout() {
  session.set(null);
}

// Изменения профиля из настроек и формы продажи. dealerProfile дополняется, а не заменяется.
// TODO(backend): PATCH /api/me, затем обновить сессию ответом сервера
export type ProfilePatch = Partial<Pick<User, "name" | "email" | "phone" | "city">> & { dealerProfile?: DealerProfile };

export async function updateProfile(patch: ProfilePatch) {
  const user = session.get();
  if (!user) return;
  session.set({
    ...user,
    ...patch,
    dealerProfile: patch.dealerProfile ? { ...user.dealerProfile, ...patch.dealerProfile } : user.dealerProfile,
  });
}

export function useAuth() {
  // на сервере пользователя нет — после гидратации подхватится из localStorage
  const user = session.useValue();
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
