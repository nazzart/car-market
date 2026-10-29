"use server";

// Модерация: Server Actions. Всё, кроме жалобы покупателя, — только для модератора (requireAdmin).
// После решения — updateTag: каталог и страницы сразу показывают новое состояние
import { updateTag } from "next/cache";

import { getRegisteredUsers, getSessionUser, requireAdmin } from "@/features/auth/api";
import type { User } from "@/features/auth/types";
import { getAllListings } from "@/features/cars/api";
import type { Listing } from "@/features/cars/types";
import { collections } from "@/features/collections/config";
import { cleanText, parseListingId } from "@/lib/validate";

import type { AccountKey } from "./accounts";
import * as moderation from "./api";
import { BLOCK_REASONS, type BlockReason, type LogEntry, type Report } from "./types";

const reasonOf = (reason: unknown): BlockReason => {
  if (!BLOCK_REASONS.includes(reason as BlockReason)) throw new Error("Неверная причина");
  return reason as BlockReason;
};
const noteOf = (note: unknown) => cleanText(note, 1000) || undefined;
const accountOf = (account: unknown): AccountKey => {
  if (typeof account !== "string" || !/^(dealer|user):[\w-]{1,80}$/.test(account)) throw new Error("Неверный аккаунт");
  return account as AccountKey;
};

export type AdminData = { listings: Listing[]; users: User[]; reports: Report[]; log: LogEntry[] };

// Всё для /admin одним запросом. TODO(admin): постранично и с поиском, когда объявлений станут тысячи
export async function loadAdminData(): Promise<AdminData> {
  await requireAdmin();
  const [listings, users, reports, log] = await Promise.all([
    getAllListings(),
    getRegisteredUsers(),
    moderation.getReports(),
    moderation.getModerationLog(),
  ]);
  return { listings, users, reports, log };
}

export async function blockListing(id: string, reason: BlockReason, note?: string) {
  await moderation.moderateListing(await requireAdmin(), parseListingId(id), "blocked", reasonOf(reason), noteOf(note));
  updateTag("listings");
}

export async function removeListing(id: string, reason: BlockReason) {
  await moderation.moderateListing(await requireAdmin(), parseListingId(id), "removed", reasonOf(reason));
  updateTag("listings");
}

export async function clearModeration(id: string) {
  await moderation.clearListingModeration(await requireAdmin(), parseListingId(id));
  updateTag("listings");
}

export async function dismissReports(id: string) {
  await moderation.dismissListingReports(await requireAdmin(), parseListingId(id));
}

export async function approveListing(id: string) {
  await moderation.approveListing(await requireAdmin(), parseListingId(id));
  updateTag("listings");
}

export async function rejectListing(id: string, reason: BlockReason, note?: string) {
  await moderation.rejectListing(await requireAdmin(), parseListingId(id), reasonOf(reason), noteOf(note));
  updateTag("listings");
}

export async function setExcluded(id: string, slug: string, exclude: boolean) {
  if (!collections.some((c) => c.slug === slug)) throw new Error("Неизвестная подборка");
  await moderation.setExcludedCollection(await requireAdmin(), parseListingId(id), slug, Boolean(exclude));
  updateTag("listings");
}

export async function blockAccount(account: string, reason: BlockReason, note?: string) {
  await moderation.blockAccount(await requireAdmin(), accountOf(account), reasonOf(reason), noteOf(note));
  updateTag("listings");
  updateTag("dealers");
}

export async function unblockAccount(account: string) {
  await moderation.unblockAccount(await requireAdmin(), accountOf(account));
  updateTag("listings");
  updateTag("dealers");
}

export async function setDealerVerified(slug: string, verified: boolean) {
  await moderation.setDealerVerified(await requireAdmin(), accountOf(`dealer:${slug}`).slice(7), Boolean(verified));
  updateTag("dealers");
}

// Жалоба покупателя — можно и без входа. TODO: ограничение частоты (rate limit) перед запуском
export async function addReport(id: string, reason: BlockReason, text?: string) {
  await moderation.addReport(parseListingId(id), reasonOf(reason), noteOf(text), await getSessionUser());
}
