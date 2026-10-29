// Модерация на сервере: решения по объявлениям, жалобы, блокировка аккаунтов, проверка дилеров, журнал.
// Функции получают уже проверенного модератора (requireAdmin в ./actions); жалобы может оставить любой
import "server-only";

import { and, desc, eq, isNull, sql } from "drizzle-orm";

import type { User } from "@/features/auth/types";
import { db, schema } from "@/lib/db";

import type { AccountKey } from "./accounts";
import type { BlockReason, LogAction, LogEntry, Moderation, Report } from "./types";

const { listings, dealers, profiles, reports, moderationLog } = schema;

async function log(actor: User, entry: { listingId?: number; account?: string; action: LogAction; reason?: BlockReason }) {
  await db.insert(moderationLog).values({ actorId: actor.id, ...entry });
}

// все открытые жалобы на объявление закрываются решением модератора
const resolveReports = (listingId: number, resolved: NonNullable<Report["resolved"]>) =>
  db.update(reports).set({ resolved }).where(and(eq(reports.listingId, listingId), isNull(reports.resolved)));

/* ---------- Чтение для /admin ---------- */

export async function getReports(): Promise<Report[]> {
  const rows = await db.select().from(reports).orderBy(desc(reports.createdAt)).limit(500);
  return rows.map((r) => ({
    id: String(r.id),
    listingId: String(r.listingId),
    reason: r.reason,
    ...(r.text ? { text: r.text } : {}),
    at: r.createdAt.getTime(),
    ...(r.resolved ? { resolved: r.resolved } : {}),
  }));
}

export async function getModerationLog(): Promise<LogEntry[]> {
  const rows = await db.select().from(moderationLog).orderBy(desc(moderationLog.createdAt)).limit(200);
  return rows.map((r) => ({
    at: r.createdAt.getTime(),
    action: r.action,
    ...(r.listingId !== null ? { listingId: String(r.listingId) } : {}),
    ...(r.account ? { account: r.account } : {}),
    ...(r.reason ? { reason: r.reason } : {}),
  }));
}

/* ---------- Объявления ---------- */

export async function moderateListing(actor: User, listingId: number, status: Moderation["status"], reason: BlockReason, note?: string) {
  await db
    .update(listings)
    .set({ moderationStatus: status, moderationReason: reason, moderationNote: note ?? null, moderatedAt: new Date() })
    .where(eq(listings.id, listingId));
  await resolveReports(listingId, "blocked");
  await log(actor, { listingId, action: status === "removed" ? "remove" : "block", reason });
}

export async function clearListingModeration(actor: User, listingId: number) {
  const [prev] = await db
    .select({ status: listings.moderationStatus })
    .from(listings)
    .where(eq(listings.id, listingId));
  await db
    .update(listings)
    .set({ moderationStatus: null, moderationReason: null, moderationNote: null, moderatedAt: null })
    .where(eq(listings.id, listingId));
  await log(actor, { listingId, action: prev?.status === "removed" ? "restore" : "unblock" });
}

export async function dismissListingReports(actor: User, listingId: number) {
  await resolveReports(listingId, "dismissed");
  await log(actor, { listingId, action: "dismiss" });
}

// Премодерация: одобрить — объявление становится видно; отклонить — заблокировать с причиной для продавца
export async function approveListing(actor: User, listingId: number) {
  await db.update(listings).set({ review: null }).where(eq(listings.id, listingId));
  await log(actor, { listingId, action: "approve" });
}

export async function rejectListing(actor: User, listingId: number, reason: BlockReason, note?: string) {
  await db
    .update(listings)
    .set({ review: null, moderationStatus: "blocked", moderationReason: reason, moderationNote: note ?? null, moderatedAt: new Date() })
    .where(eq(listings.id, listingId));
  await log(actor, { listingId, action: "reject", reason });
}

// Убрать объявление из подборки (или вернуть)
export async function setExcludedCollection(actor: User, listingId: number, slug: string, exclude: boolean) {
  await db
    .update(listings)
    .set({
      excludedCollections: exclude
        ? sql`array(select distinct unnest(array_append(${listings.excludedCollections}, ${slug})))`
        : sql`array_remove(${listings.excludedCollections}, ${slug})`,
    })
    .where(eq(listings.id, listingId));
  await log(actor, { listingId, action: exclude ? "exclude" : "include" });
}

/* ---------- Аккаунты и дилеры ---------- */

// Ключ аккаунта: «dealer:<slug>» — компания (её страница и объявления), «user:<uuid>» — частное лицо
async function setAccountBlock(account: AccountKey, block: { reason: BlockReason; note?: string } | null) {
  const values = block
    ? { blockedReason: block.reason, blockedNote: block.note ?? null, blockedAt: new Date() }
    : { blockedReason: null, blockedNote: null, blockedAt: null };
  const [kind, id] = account.split(":") as ["dealer" | "user", string];
  if (kind === "dealer") await db.update(dealers).set(values).where(eq(dealers.slug, id));
  else await db.update(profiles).set(values).where(eq(profiles.id, id));
}

export async function blockAccount(actor: User, account: AccountKey, reason: BlockReason, note?: string) {
  await setAccountBlock(account, { reason, note });
  await log(actor, { account, action: "blockAccount", reason });
}

export async function unblockAccount(actor: User, account: AccountKey) {
  await setAccountBlock(account, null);
  await log(actor, { account, action: "unblockAccount" });
}

export async function setDealerVerified(actor: User, slug: string, verified: boolean) {
  await db.update(dealers).set({ verified }).where(eq(dealers.slug, slug));
  await log(actor, { account: `dealer:${slug}`, action: verified ? "verify" : "unverify" });
}

/* ---------- Жалобы покупателей ---------- */

export async function addReport(listingId: number, reason: BlockReason, text: string | undefined, reporter: User | null) {
  await db.insert(reports).values({ listingId, reason, text: text ?? null, reporterId: reporter?.id ?? null });
}
