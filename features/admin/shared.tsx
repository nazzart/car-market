"use client";

import { useState } from "react";
import Image from "next/image";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";

import { Listing, listings } from "@/features/cars/data/listings";
import { dealers } from "@/features/dealers/data/dealers";
import {
  BlockReason,
  blockAccount,
  blockListing,
  rejectListing,
  removeListing,
  useReports,
} from "@/features/moderation/store";
import { useVisibility } from "@/features/moderation/visibility";
import { cn } from "@/lib/utils";

import ModerationDialog, { DialogMode } from "./ModerationDialog";

export type StatusKey =
  | "active"
  | "paused"
  | "sold"
  | "deleted"
  | "blocked"
  | "removed"
  | "pending"
  | "accountBlocked";

export const statusTone: Record<StatusKey, string> = {
  active: "bg-emerald-50 text-emerald-700",
  paused: "bg-gray-100 text-gray-600",
  sold: "bg-sky-50 text-sky-700",
  deleted: "bg-gray-100 text-gray-500",
  blocked: "bg-red-50 text-red-700",
  removed: "bg-red-100 text-red-800",
  pending: "bg-amber-50 text-amber-800",
  accountBlocked: "bg-red-50 text-red-700",
};

// имя продавца; у частных объявлений его может не быть — тогда «Частное лицо»
export const sellerOf = (l: Listing, privateLabel: string) =>
  (l.dealer ? dealers.find((d) => d.slug === l.dealer)?.name : undefined) ?? l.sellerName ?? privateLabel;

export const minutesSince = (at: number) => Math.max(0, Math.round((Date.now() - at) / 60000));

export const listingTitle = (id?: string) => (id ? (listings.find((l) => l.id === id)?.title ?? `#${id}`) : "");

// Итоговый статус объявления для модератора
export function useListingAdmin() {
  const { of, isPublic } = useVisibility();
  const reports = useReports();

  const statusKey = (id: string): StatusKey => {
    const v = of(id);
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

export function Thumb({ listing, muted }: { listing: Listing; muted?: boolean }) {
  return (
    <div className="relative w-20 sm:w-24 aspect-[4/3] shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
      {listing.images[0] ? (
        <Image
          src={listing.images[0]}
          alt=""
          fill
          sizes="96px"
          className={cn("object-cover", muted && "grayscale opacity-70")}
        />
      ) : (
        <DirectionsCarOutlinedIcon className="text-gray-300" />
      )}
    </div>
  );
}

export function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium", tone)}>{children}</span>;
}

export function EmptyBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center py-14 rounded-2xl border border-dashed border-gray-200 text-gray-500">{children}</div>
  );
}

export const pillClass = (active: boolean) =>
  cn(
    "shrink-0 px-3.5 py-1.5 rounded-full border text-sm transition cursor-pointer",
    active ? "bg-gray-900 border-gray-900 text-white" : "border-gray-200 text-gray-700 hover:border-gray-900"
  );
