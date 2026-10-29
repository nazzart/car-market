"use client";

import { useState } from "react";

import type { BadgeTone } from "@/components/ui/types";
import CarPhoto from "@/components/ui/CarPhoto";
import { Listing } from "@/features/cars/types";
import { useDealerCatalog, useDealerLookup } from "@/features/dealers/hooks";
import { blockAccount, blockListing, rejectListing, removeListing, useAdminState, useReports } from "@/features/moderation/store";
import { type BlockReason } from "@/features/moderation/types";
import { useVisibility } from "@/features/moderation/visibility";
import { cn } from "@/lib/utils";

import ModerationDialog from "./ModerationDialog";
import type { DialogMode, StatusKey } from "./types";

export const statusTone: Record<StatusKey, BadgeTone> = {
  active: "success",
  paused: "muted",
  sold: "info",
  deleted: "muted",
  blocked: "danger",
  removed: "dangerStrong",
  pending: "warning",
  accountBlocked: "danger",
};

export const minutesSince = (at: number) => Math.max(0, Math.round((Date.now() - at) / 60000));

// Всё, что видит модератор: весь каталог, включая скрытое, и подписи к нему (загружает AdminDataProvider).
// TODO(admin): запросы с пагинацией и поиском на сервере вместо загрузки всего каталога
export function useAdminData() {
  const state = useAdminState(); // null — ещё загружается
  const listings = state?.listings ?? [];
  const byId = new Map(listings.map((l) => [l.id, l]));
  const listingOf = (id: string) => byId.get(id);
  const dealers = useDealerCatalog();
  const dealerOf = useDealerLookup();
  const users = state?.users ?? [];

  return {
    loading: state === null,
    listings,
    dealers,
    users,
    listingOf,
    // имя продавца; у частных объявлений его может не быть — тогда «Частное лицо»
    sellerOf: (l: Listing, privateLabel: string) =>
      (l.dealer ? dealerOf(l.dealer)?.name : undefined) ?? l.sellerName ?? privateLabel,
    listingTitle: (id?: string) => (id ? (listingOf(id)?.title ?? `#${id}`) : ""),
    // «dealer:baltic-auto» → «Baltic Auto»
    accountName: (key?: string) => {
      if (!key) return "";
      const [kind, id] = key.split(":");
      return (kind === "dealer" ? dealerOf(id)?.name : users.find((u) => u.id === id)?.name) ?? id;
    },
  };
}

// Итоговый статус объявления для модератора
export function useListingAdmin() {
  const visibility = useVisibility();
  const { listingOf } = useAdminData();
  const reports = useReports();

  // по id объявления из каталога модератора; удалённое из базы — «удалено»
  const of = (id: string) => {
    const listing = listingOf(id);
    return listing ? visibility.of(listing) : undefined;
  };
  const isPublic = (id: string) => of(id) !== undefined && visibility.isPublic(listingOf(id)!);

  const statusKey = (id: string): StatusKey => {
    const v = of(id);
    if (!v) return "deleted";
    if (v.moderation) return v.moderation.status;
    if (v.accountBlock) return "accountBlocked";
    if (v.pending) return "pending";
    return v.seller;
  };
  const openReports = (id: string) => reports.filter((r) => r.listingId === id && !r.resolved);

  return { statusKey, isPublic, openReports, of };
}

// Один диалог на вкладку: блокировка / удаление / отклонение объявления или блокировка аккаунта
export function useModerationDialog() {
  const [state, setState] = useState<{
    mode: DialogMode;
    id: string; // id объявления или ключ аккаунта
    name: string;
    reason?: BlockReason;
  } | null>(null);

  const dialog = (
    <ModerationDialog
      mode={state?.mode ?? null}
      name={state?.name ?? ""}
      defaultReason={state?.reason}
      onClose={() => setState(null)}
      onConfirm={(reason, note) => {
        if (!state) return;
        const n = note || undefined;
        if (state.mode === "block") blockListing(state.id, reason, n);
        if (state.mode === "remove") removeListing(state.id, reason);
        if (state.mode === "reject") rejectListing(state.id, reason, n);
        if (state.mode === "blockAccount") blockAccount(state.id, reason, n);
        setState(null);
      }}
    />
  );

  const open = (mode: DialogMode) => (id: string, name: string, reason?: BlockReason) =>
    setState({ mode, id, name, reason });

  return {
    dialog,
    block: open("block"),
    remove: open("remove"),
    reject: open("reject"),
    blockAccount: open("blockAccount"),
  };
}

type ThumbProps = { listing: Listing; muted?: boolean };

export function Thumb({ listing, muted }: ThumbProps) {
  return (
    <CarPhoto
      src={listing.images[0]}
      alt=""
      sizes="96px"
      iconSize={24}
      className="w-20 sm:w-24 shrink-0 rounded-lg"
      imageClassName={cn(muted && "grayscale opacity-70")}
    />
  );
}

export const pillClass = (active: boolean) =>
  cn(
    "shrink-0 px-3.5 py-1.5 rounded-full border text-sm transition cursor-pointer",
    active ? "bg-gray-900 border-gray-900 text-white" : "border-gray-200 text-gray-700 hover:border-gray-900"
  );
