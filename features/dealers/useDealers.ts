"use client";

import { useMemo } from "react";

import { dealerAccount } from "@/features/moderation/accounts";
import { useBlockedAccounts } from "@/features/moderation/store";

import { useDealerCatalog } from "./hooks";
import { useOwnDealer } from "./useOwnDealer";

// Каталог дилеров для покупателей: свой профиль вошедшего дилера — с изменениями из настроек,
// заблокированные модератором — скрыты
export function useDealers() {
  const catalog = useDealerCatalog();
  const own = useOwnDealer();
  const blocked = useBlockedAccounts();

  return useMemo(
    () =>
      catalog
        .map((d) => (own && d.slug === own.slug ? own : d))
        .filter((d) => !blocked[dealerAccount(d.slug)]),
    [catalog, own, blocked]
  );
}
