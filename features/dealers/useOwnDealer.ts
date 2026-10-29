"use client";

import { useMemo } from "react";

import { loadOwnDealer } from "@/features/account/actions";
import { useAuth } from "@/features/auth/store";
import type { User } from "@/features/auth/types";
import { placePointOrRiga } from "@/lib/places";
import { useServerData } from "@/lib/useServerData";

import { useDealerLookup } from "./hooks";
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

// Своя страница дилера — с сервера, мимо кэша: каталог в layout обновляется не сразу (новый дилер,
// правка из базы). Пока она грузится — данные из каталога. null — не вошёл или это не дилер
export function useOwnDealerState(): { dealer: Dealer | null; loading: boolean } {
  const { user } = useAuth();
  const cached = useDealerLookup()(user?.dealerSlug);
  const isDealer = user?.type === "dealer";
  // ttl: 0 — при каждом открытии кабинета или настроек заново
  const fresh = useServerData(
    isDealer && user ? `own-dealer:${user.id}` : null,
    () => loadOwnDealer().catch(() => null),
    { ttl: 0, keepPrevious: false }
  );

  return useMemo(() => {
    if (!isDealer || !user) return { dealer: null, loading: false };
    return { dealer: resolveDealer(user, fresh ?? cached), loading: fresh === undefined };
  }, [isDealer, user, fresh, cached]);
}

export function useOwnDealer(): Dealer | null {
  return useOwnDealerState().dealer;
}
