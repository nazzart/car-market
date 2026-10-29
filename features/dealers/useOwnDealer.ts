"use client";

import { useMemo } from "react";

import { useAuth } from "@/features/auth/store";
import type { User } from "@/features/auth/types";
import { placePointOrRiga } from "@/lib/places";

import { useDealerLookup } from "./hooks";
import type { Dealer } from "./types";

// Страница дилера вошедшей компании — из базы (каталог дилеров). Если каталог ещё не обновился
// после регистрации — пустые значения вместо undefined
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

// Дилер вошедшего пользователя; null — не вошёл или это не дилер
export function useOwnDealer(): Dealer | null {
  const { user } = useAuth();
  const base = useDealerLookup()(user?.dealerSlug);
  return useMemo(() => (user?.type === "dealer" ? resolveDealer(user, base) : null), [user, base]);
}
