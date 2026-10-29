"use client";

import { useMemo } from "react";

import { useAuth } from "@/features/auth/store";
import type { User } from "@/features/auth/types";
import { placePointOrRiga } from "@/lib/places";

import { useDealerLookup } from "./api";
import type { Dealer } from "./types";

// Профиль дилера, как его видят все: каталог + сохранённые настройки + данные аккаунта.
// Единые правила: имя и телефон — из аккаунта (пустой телефон → телефон из каталога).
// У нового дилера без страницы в каталоге — пустые значения вместо undefined
export function resolveDealer(user: User, base: Dealer | undefined): Dealer {
  const city = user.dealerProfile?.city ?? base?.city ?? user.city;
  const fallback: Dealer = {
    slug: user.dealerSlug ?? "",
    name: user.name,
    type: "used",
    brands: [],
    city,
    address: "",
    ...placePointOrRiga(city),
    phone: "",
    contacts: [],
    hours: {},
    carsInStock: 0,
    since: user.since,
  };

  return {
    ...fallback,
    ...base,
    ...user.dealerProfile,
    name: user.name || base?.name || "",
    phone: user.phone || base?.phone || "",
  };
}

// Дилер вошедшего пользователя; null — не вошёл или это не дилер
export function useOwnDealer(): Dealer | null {
  const { user } = useAuth();
  const base = useDealerLookup()(user?.dealerSlug);
  return useMemo(() => (user?.type === "dealer" ? resolveDealer(user, base) : null), [user, base]);
}
