"use client";

import { useEffect, useMemo, useState } from "react";

import { loadOwnDealer } from "@/features/account/actions";
import { useAuth } from "@/features/auth/store";
import type { User } from "@/features/auth/types";
import { placePointOrRiga } from "@/lib/places";

import { useDealerLookup } from "./hooks";
import type { Dealer } from "./types";

// Страница дилера вошедшей компании. Недостающие поля — пустые значения вместо undefined
export function resolveDealer(user: User, base: Dealer | undefined): Dealer {
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
  const [fresh, setFresh] = useState<{ userId: string; dealer: Dealer | null } | null>(null);

  useEffect(() => {
    if (!isDealer || !user) return;
    let alive = true;
    loadOwnDealer()
      .catch(() => null)
      .then((dealer) => alive && setFresh({ userId: user.id, dealer }));
    return () => {
      alive = false;
    };
  }, [isDealer, user]);

  return useMemo(() => {
    if (!isDealer || !user) return { dealer: null, loading: false };
    const loaded = fresh?.userId === user.id;
    return { dealer: resolveDealer(user, (loaded ? fresh.dealer : null) ?? cached), loading: !loaded };
  }, [isDealer, user, fresh, cached]);
}

export function useOwnDealer(): Dealer | null {
  return useOwnDealerState().dealer;
}
