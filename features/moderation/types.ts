// Модерация: причины, решения, жалобы, журнал. Общие типы для базы (lib/db/schema.ts), сервера и интерфейса

export type BlockReason = "fraud" | "wrongPrice" | "wrongInfo" | "duplicate" | "sold" | "prohibited" | "other";
export const BLOCK_REASONS: BlockReason[] = ["fraud", "wrongPrice", "wrongInfo", "duplicate", "sold", "prohibited", "other"];

// Решение модератора по объявлению: важнее статуса продавца — заблокированное нельзя снова включить из кабинета
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

export type LogAction =
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
  | "unverify"
  // каталог марок и моделей (account — «catalog:<марка / модель>»)
  | "catalogAdd"
  | "catalogEdit"
  | "catalogDelete";

export type LogEntry = {
  at: number;
  listingId?: string;
  account?: string; // «dealer:baltic-auto» / «user:<uuid>»
  action: LogAction;
  reason?: BlockReason;
};

// Блокировка аккаунта продавца (дилера или пользователя): скрывает все его объявления
export type AccountBlock = { reason: BlockReason; note?: string; at: number };
