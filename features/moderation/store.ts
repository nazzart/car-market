"use client";

import { createLocalStore } from "@/lib/localStore";

import { dealerAccount } from "./accounts";

// Модерация (демо: всё в браузере; позже — таблицы в БД и проверка роли на сервере).
// Решение модератора важнее статуса продавца: заблокированное нельзя снова активировать из кабинета

export type BlockReason = "fraud" | "wrongPrice" | "wrongInfo" | "duplicate" | "sold" | "prohibited" | "other";
export const BLOCK_REASONS: BlockReason[] = ["fraud", "wrongPrice", "wrongInfo", "duplicate", "sold", "prohibited", "other"];

export type Moderation = {
  status: "blocked" | "removed";
  reason: BlockReason;
  note?: string; // пояснение для продавца
  at: number;
};

export type Report = {
  id: string;
  listingId: string;
  reason: BlockReason;
  text?: string;
  at: number;
  resolved?: "blocked" | "dismissed";
};

export type LogEntry = {
  at: number;
  listingId?: string;
  account?: string; // «dealer:baltic-auto» / «user:demo-individual»
  action:
    | "block"
    | "unblock"
    | "remove"
    | "restore"
    | "dismiss"
    | "approve"
    | "reject"
    | "exclude"
    | "include"
    | "blockAccount"
    | "unblockAccount"
    | "verify"
    | "unverify";
  reason?: BlockReason;
};

// Аккаунт продавца: дилер или зарегистрированный пользователь
export type AccountBlock = { reason: BlockReason; note?: string; at: number };

const moderation = createLocalStore<Record<string, Moderation>>("bestauto.moderation", {});
const reports = createLocalStore<Report[]>("bestauto.reports", []);
const log = createLocalStore<LogEntry[]>("bestauto.moderationLog", []);
// решения по новым объявлениям (премодерация)
const approvals = createLocalStore<Record<string, "approved" | "rejected">>("bestauto.approvals", {});
// модератор убрал объявление из подборки: listingId → slug подборок
const excluded = createLocalStore<Record<string, string[]>>("bestauto.collectionExcluded", {});
const blockedAccounts = createLocalStore<Record<string, AccountBlock>>("bestauto.blockedAccounts", {});
// ручная проверка дилеров поверх данных (verified в dealers.ts)
const verification = createLocalStore<Record<string, boolean>>("bestauto.dealerVerification", {});

export const useApprovals = approvals.useValue;
export const useExcluded = excluded.useValue;
export const useBlockedAccounts = blockedAccounts.useValue;
export const useVerification = verification.useValue;

export const useModeration = moderation.useValue;
export const useReports = reports.useValue;
export const useModerationLog = log.useValue;

const addLog = (entry: Omit<LogEntry, "at">) => log.set([{ ...entry, at: Date.now() }, ...log.get()].slice(0, 200));

// все открытые жалобы на объявление закрываются решением модератора
const resolveReports = (listingId: string, resolved: Report["resolved"]) =>
  reports.set(reports.get().map((r) => (r.listingId === listingId && !r.resolved ? { ...r, resolved } : r)));

export function blockListing(listingId: string, reason: BlockReason, note?: string) {
  moderation.set({ ...moderation.get(), [listingId]: { status: "blocked", reason, note, at: Date.now() } });
  resolveReports(listingId, "blocked");
  addLog({ listingId, action: "block", reason });
}

export function removeListing(listingId: string, reason: BlockReason) {
  moderation.set({ ...moderation.get(), [listingId]: { status: "removed", reason, at: Date.now() } });
  resolveReports(listingId, "blocked");
  addLog({ listingId, action: "remove", reason });
}

export function clearModeration(listingId: string) {
  const prev = moderation.get()[listingId];
  const next = { ...moderation.get() };
  delete next[listingId];
  moderation.set(next);
  addLog({ listingId, action: prev?.status === "removed" ? "restore" : "unblock" });
}

export function dismissReports(listingId: string) {
  resolveReports(listingId, "dismissed");
  addLog({ listingId, action: "dismiss" });
}

export function addReport(listingId: string, reason: BlockReason, text?: string) {
  reports.set([{ id: `${Date.now()}`, listingId, reason, text, at: Date.now() }, ...reports.get()]);
}

/* ---------- Премодерация новых объявлений ---------- */

export function approveListing(listingId: string) {
  approvals.set({ ...approvals.get(), [listingId]: "approved" });
  addLog({ listingId, action: "approve" });
}

// отклонить = заблокировать с причиной (продавец видит её в кабинете)
export function rejectListing(listingId: string, reason: BlockReason, note?: string) {
  approvals.set({ ...approvals.get(), [listingId]: "rejected" });
  moderation.set({ ...moderation.get(), [listingId]: { status: "blocked", reason, note, at: Date.now() } });
  addLog({ listingId, action: "reject", reason });
}

/* ---------- Подборки ---------- */

export function setExcluded(listingId: string, slug: string, exclude: boolean) {
  const current = excluded.get()[listingId] ?? [];
  const next = exclude ? [...new Set([...current, slug])] : current.filter((s) => s !== slug);
  excluded.set({ ...excluded.get(), [listingId]: next });
  addLog({ listingId, action: exclude ? "exclude" : "include" });
}

/* ---------- Аккаунты и дилеры ---------- */

export function blockAccount(account: string, reason: BlockReason, note?: string) {
  blockedAccounts.set({ ...blockedAccounts.get(), [account]: { reason, note, at: Date.now() } });
  addLog({ account, action: "blockAccount", reason });
}

export function unblockAccount(account: string) {
  const next = { ...blockedAccounts.get() };
  delete next[account];
  blockedAccounts.set(next);
  addLog({ account, action: "unblockAccount" });
}

export function setDealerVerified(slug: string, verified: boolean) {
  verification.set({ ...verification.get(), [slug]: verified });
  addLog({ account: dealerAccount(slug), action: verified ? "verify" : "unverify" });
}
