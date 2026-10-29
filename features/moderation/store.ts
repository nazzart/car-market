"use client";

// Модерация в браузере: данные /admin загружаются с сервера (loadAdminData) и хранятся в AdminDataProvider,
// решения отправляются Server Actions (проверка роли — на сервере), после каждого — данные перечитываются
import { createContext, createElement, useContext, useEffect, useState } from "react";

import { useDealerCatalog } from "@/features/dealers/hooks";

import * as actions from "./actions";
import type { AdminData } from "./actions";
import { dealerAccount, userAccount } from "./accounts";
import type { AccountBlock } from "./types";

const CHANGED = "bestauto:admin-changed";

const AdminDataContext = createContext<AdminData | null>(null);

// Только на /admin и только для модератора: всё, что видит модератор, — одним запросом
export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AdminData | null>(null);

  useEffect(() => {
    const reload = () => actions.loadAdminData().then(setData);
    reload();
    window.addEventListener(CHANGED, reload);
    return () => window.removeEventListener(CHANGED, reload);
  }, []);

  return createElement(AdminDataContext.Provider, { value: data }, children);
}

// null — ещё загружается
export const useAdminState = () => useContext(AdminDataContext);

export const useReports = () => useAdminState()?.reports ?? [];
export const useModerationLog = () => useAdminState()?.log ?? [];

// Заблокированные аккаунты: дилеры — из каталога дилеров, частные лица — из списка пользователей
export function useBlockedAccounts(): Record<string, AccountBlock> {
  const users = useAdminState()?.users ?? [];
  const dealers = useDealerCatalog();
  return Object.fromEntries([
    ...dealers.flatMap((d) => (d.blocked ? [[dealerAccount(d.slug), d.blocked] as const] : [])),
    ...users.flatMap((u) => (u.blocked && u.type !== "dealer" ? [[userAccount(u.id), u.blocked] as const] : [])),
  ]);
}

// Объявление → подборки, из которых модератор его убрал
export function useExcluded(): Record<string, string[]> {
  const listings = useAdminState()?.listings ?? [];
  return Object.fromEntries(listings.flatMap((l) => (l.excludedCollections ? [[l.id, l.excludedCollections]] : [])));
}

// Решение модератора → на сервер, затем перечитать данные /admin
const run =
  <Args extends unknown[]>(action: (...args: Args) => Promise<void>) =>
  async (...args: Args) => {
    await action(...args);
    window.dispatchEvent(new Event(CHANGED));
  };

export const blockListing = run(actions.blockListing);
export const removeListing = run(actions.removeListing);
export const clearModeration = run(actions.clearModeration);
export const dismissReports = run(actions.dismissReports);
export const approveListing = run(actions.approveListing);
export const rejectListing = run(actions.rejectListing);
export const setExcluded = run(actions.setExcluded);
export const blockAccount = run(actions.blockAccount);
export const unblockAccount = run(actions.unblockAccount);
export const setDealerVerified = run(actions.setDealerVerified);

// Жалоба покупателя (кнопка «Пожаловаться» на странице объявления)
export const addReport = actions.addReport;
