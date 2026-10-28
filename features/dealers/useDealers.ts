"use client";

import { useMemo } from "react";

import { useAuth } from "@/features/auth/store";
import { useBlockedAccounts } from "@/features/moderation/store";

import { dealers } from "./data/dealers";

// Каталог дилеров + то, что вошедший дилер сохранил в настройках (демо: профиль лежит в localStorage).
// TODO: заменить на запрос к API, когда профиль дилера будет сохраняться в БД
export function useDealers() {
  const { user } = useAuth();
  const blocked = useBlockedAccounts();
  const profile = user?.dealerProfile;
  const slug = user?.dealerSlug;
  const name = user?.name;
  const phone = user?.phone;

  return useMemo(
    () =>
      // заблокированные модератором дилеры не показываются в каталоге и на карте
      (profile && slug
        ? dealers.map((d) => (d.slug === slug ? { ...d, ...profile, name: name ?? d.name, phone: phone ?? d.phone } : d))
        : dealers
      ).filter((d) => !blocked[`dealer:${d.slug}`]),
    [profile, slug, name, phone, blocked]
  );
}
