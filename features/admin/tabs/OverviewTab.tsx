"use client";

import { useLocale, useTranslations } from "next-intl";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import Badge from "@/components/ui/Badge";
import { isFresh } from "@/features/cars/lib/isFresh";
import { LogEntry, useModerationLog, useReports } from "@/features/moderation/store";
import { useDealerVerified } from "@/features/moderation/visibility";
import { cn, formatAgo, formatNumber } from "@/lib/utils";

import { minutesSince, useAdminData, useListingAdmin } from "../shared";

export type AdminTab = "overview" | "approvals" | "listings" | "reports" | "collections" | "users";

const isNegative = (a: LogEntry["action"]) => ["block", "remove", "reject", "exclude", "blockAccount", "unverify"].includes(a);

// Обзор: цифры + «что требует внимания» (каждая задача ведёт на свою вкладку) + журнал действий
export default function OverviewTab({ onOpen }: { onOpen: (tab: AdminTab) => void }) {
  const t = useTranslations("moderation.admin");
  const locale = useLocale();
  const { statusKey, isPublic } = useListingAdmin();
  const reports = useReports();
  const log = useModerationLog();
  const isVerified = useDealerVerified();
  const { listings, dealers, listingTitle, accountName } = useAdminData();

  const pending = listings.filter((l) => statusKey(l.id) === "pending").length;
  const openReports = reports.filter((r) => !r.resolved).length;
  const unverified = dealers.filter((d) => !isVerified(d.slug)).length;

  const stats = [
    { label: t("stats.total"), value: listings.length },
    { label: t("stats.public"), value: listings.filter((l) => isPublic(l.id)).length },
    { label: t("stats.blocked"), value: listings.filter((l) => ["blocked", "removed", "accountBlocked"].includes(statusKey(l.id))).length },
    { label: t("stats.fresh"), value: listings.filter(isFresh).length },
  ];

  const tasks: { key: string; count: number; tab: AdminTab }[] = [
    { key: "pending", count: pending, tab: "approvals" },
    { key: "reports", count: openReports, tab: "reports" },
    { key: "unverified", count: unverified, tab: "users" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-gray-50">
            <div className="text-2xl font-semibold tracking-tight">{formatNumber(s.value)}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold mb-3">{t("queue.title")}</h2>
          <ul className="space-y-2">
            {tasks.map(({ key, count, tab }) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onOpen(tab)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-left transition cursor-pointer",
                    count > 0 ? "bg-red-50 hover:bg-red-100" : "bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  <span className={cn("text-2xl font-semibold w-10 text-center", count > 0 ? "text-red-700" : "text-gray-400")}>
                    {count}
                  </span>
                  <span className="flex-1 text-sm font-medium text-gray-900">{t(`tasks.${key}`)}</span>
                  <ArrowForwardIcon sx={{ fontSize: 18 }} className="text-gray-400" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold mb-3">{t("log.title")}</h2>
          {log.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">{t("log.empty")}</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {log.slice(0, 10).map((e) => (
                <li key={`${e.at}-${e.listingId ?? e.account}-${e.action}`} className="py-2.5 flex items-center gap-3 text-sm">
                  <Badge tone={isNegative(e.action) ? "danger" : "neutral"} className="shrink-0">
                    {t(`log.${e.action}`)}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-gray-900">
                    {e.listingId ? listingTitle(e.listingId) : accountName(e.account)}
                  </span>
                  <span className="shrink-0 text-xs text-gray-500">{formatAgo(minutesSince(e.at), locale)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
