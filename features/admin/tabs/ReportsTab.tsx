"use client";

import { useState } from "react";
import BlockIcon from "@mui/icons-material/Block";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import { useLocale, useTranslations } from "next-intl";

import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { Report, dismissReports, useReports } from "@/features/moderation/store";
import { Link } from "@/i18n/navigation";
import { cn, formatAgo } from "@/lib/utils";

import { minutesSince, statusTone, useAdminData, useListingAdmin, useModerationDialog } from "../shared";

// Жалобы покупателей, сгруппированные по объявлению: решение принимается про объявление целиком
export default function ReportsTab() {
  const t = useTranslations("moderation.admin");
  const tReasons = useTranslations("moderation.reasons");
  const { listingOf, sellerOf } = useAdminData();
  const locale = useLocale();
  const reports = useReports();
  const { statusKey } = useListingAdmin();
  const { dialog, block } = useModerationDialog();
  const [showResolved, setShowResolved] = useState(false);

  const shown = reports.filter((r) => Boolean(r.resolved) === showResolved);
  const groups = Object.values(
    shown.reduce<Record<string, Report[]>>((acc, r) => {
      (acc[r.listingId] ??= []).push(r);
      return acc;
    }, {})
  ).sort((a, b) => b.length - a.length);

  return (
    <div>
      <div className="flex gap-1 p-1 w-fit rounded-xl bg-gray-100">
        {[false, true].map((resolved) => (
          <button
            key={String(resolved)}
            type="button"
            aria-pressed={showResolved === resolved}
            onClick={() => setShowResolved(resolved)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm transition cursor-pointer",
              showResolved === resolved ? "bg-white font-medium shadow-sm" : "text-gray-600 hover:text-black"
            )}
          >
            {resolved ? t("reports.resolved") : t("reports.open")}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="mt-4">
          <EmptyState text={showResolved ? t("reports.empty") : t("queue.empty")} />
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {groups.map((group) => {
            const listing = listingOf(group[0].listingId);
            if (!listing) return null;
            const status = statusKey(listing.id);

            return (
              <article key={listing.id} className="rounded-2xl border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/listing/${listing.id}`}
                        target="_blank"
                        className="font-semibold text-gray-900 hover:underline underline-offset-4"
                      >
                        {listing.title}, {listing.year}
                      </Link>
                      <Badge tone={statusTone[status]}>{t(`status.${status}`)}</Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      #{listing.id} · {sellerOf(listing, t("table.private"))} · {t("reports.count", { count: group.length })}
                    </div>
                  </div>

                  {!showResolved && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => dismissReports(listing.id)}
                        className="h-9 px-4 rounded-full border border-gray-200 hover:border-gray-900 text-sm font-medium transition cursor-pointer"
                      >
                        {t("actions.dismiss")}
                      </button>
                      <button
                        type="button"
                        onClick={() => block(listing.id, listing.title, group[0].reason)}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-error hover:opacity-90 text-white text-sm font-semibold transition cursor-pointer"
                      >
                        <BlockIcon sx={{ fontSize: 16 }} />
                        {t("actions.block")}
                      </button>
                    </div>
                  )}
                </div>

                <ul className="mt-3 space-y-2">
                  {group.map((r) => (
                    <li key={r.id} className="flex gap-2.5 p-3 rounded-xl bg-gray-50 text-sm">
                      <FlagOutlinedIcon sx={{ fontSize: 18 }} className="text-red-600 shrink-0 mt-px" />
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900">
                          {tReasons(r.reason)}
                          <span className="font-normal text-gray-500"> · {formatAgo(minutesSince(r.at), locale)}</span>
                          {r.resolved && <span className="font-normal text-gray-500"> · {t(`reports.${r.resolved}`)}</span>}
                        </div>
                        {r.text && <p className="text-gray-700 mt-0.5 break-words">{r.text}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      )}

      {dialog}
    </div>
  );
}
