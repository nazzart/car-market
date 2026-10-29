"use client";

import { useMemo, useSyncExternalStore } from "react";

import { loadOwnDealer } from "@/features/account/actions";
import { useAuth } from "@/features/auth/store";
import type { User } from "@/features/auth/types";
import { placePointOrRiga } from "@/lib/places";
import { useServerData } from "@/lib/useServerData";

import type { Dealer } from "./types";

// Страница дилера вошедшей компании. Недостающие поля — пустые значения вместо undefined
function resolveDealer(user: User, base: Dealer | undefined): Dealer {
  return {
    slug: user.dealerSlug ?? "",
    name: user.name,
    type: "used",
    brands: [],
    city: user.city ?? "riga",
    address: "",
    ...placePointOrRiga(user.city ?? "riga"),
    phone: user.phone,
    contacts: [],
    hours: {},
    carsInStock: 0,
    since: user.since,
    ...base,
  };
}

// Номер версии: после изменения своей страницы (новый контакт, телефон) — перечитать её
let revision = 0;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function refreshOwnDealer() {
  revision++;
  listeners.forEach((l) => l());
}

// Своя страница дилера — с сервера (контакты, адрес, телефон). null — не вошёл или это не дилер
export function useOwnDealerState(): { dealer: Dealer | null; loading: boolean } {
  const { user } = useAuth();
  const isDealer = user?.type === "dealer";
  const version = useSyncExternalStore(subscribe, () => revision, () => 0);
  // ttl: 0 — при каждом открытии кабинета или настроек заново
  const fresh = useServerData(
    isDealer && user ? `own-dealer:${user.id}:${version}` : null,
    () => loadOwnDealer().catch(() => null),
    { ttl: 0 }
  );

  return useMemo(() => {
    if (!isDealer || !user) return { dealer: null, loading: false };
    return { dealer: resolveDealer(user, fresh ?? undefined), loading: fresh === undefined };
  }, [isDealer, user, fresh]);
}

export function useOwnDealer(): Dealer | null {
  return useOwnDealerState().dealer;
}
