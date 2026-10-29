"use client";

import { useMemo } from "react";

import { dealerAccount } from "@/features/moderation/accounts";
import { useBlockedAccounts } from "@/features/moderation/store";

import type { Dealer } from "./types";
import { useOwnDealer } from "./useOwnDealer";

// Дилеры из базы глазами покупателя: заблокированные модератором — скрыты, свой профиль вошедшего дилера —
// с изменениями из настроек. TODO(backend): блокировки и настройки сейчас в браузере — перенести в базу
export function useDealerOverrides() {
  const own = useOwnDealer();
  const blocked = useBlockedAccounts();

  return useMemo(() => {
    // у метки на карте — только её поля, у карточки — все
    const merge = <T extends Pick<Dealer, "slug">>(d: T): T =>
      own && d.slug === own.slug
        ? ({ ...d, ...Object.fromEntries(Object.keys(d).map((key) => [key, own[key as keyof Dealer]])) } as T)
        : d;
    return <T extends Pick<Dealer, "slug">>(list: T[]): T[] =>
      list.filter((d) => !blocked[dealerAccount(d.slug)]).map(merge);
  }, [own, blocked]);
}
