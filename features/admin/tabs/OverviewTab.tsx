"use client";

import { useLocale, useTranslations } from "next-intl";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import Card, { CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StatTile from "@/components/ui/StatTile";
import { isFresh } from "@/features/cars/lib/isFresh";
import { useModerationLog, useReports } from "@/features/moderation/store";
import { type LogEntry } from "@/features/moderation/types";
import { useDealerVerified } from "@/features/moderation/visibility";
import { cn, formatAgo, formatNumber } from "@/lib/utils";

import type { AdminTab } from "../types";
import { minutesSince, useAdminData, useListingAdmin } from "../shared";

const isNegative = (a: LogEntry["action"]) => ["block", "remove", "reject", "exclude", "blockAccount", "unverify"].includes(a);

type OverviewTabProps = { onOpen: (tab: AdminTab) => void };

// Обзор: цифры + «что требует внимания» (каждая задача ведёт на свою вкладку) + журнал действий
export default function OverviewTab({ onOpen }: OverviewTabProps) {
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
          <StatTile key={s.label} value={formatNumber(s.value)} label={s.label} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card as="section">
          <CardTitle as="h2">{t("queue.title")}</CardTitle>
          <ul className="space-y-2">
            {tasks.map(({ key, count, tab }) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onOpen(tab)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-left transition cursor-pointer",
                    count > 0 ? "bg-danger-soft hover:bg-danger-muted" : "bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  <span className={cn("text-2xl font-semibold w-10 text-center", count > 0 ? "text-danger" : "text-gray-400")}>
                    {count}
                  </span>
                  <span className="flex-1 text-sm font-medium text-gray-900">{t(`tasks.${key}`)}</span>
                  <ArrowForwardIcon sx={{ fontSize: 18 }} className="text-gray-400" />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card as="section">
          <CardTitle as="h2">{t("log.title")}</CardTitle>
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
        </Card>
      </div>
    </div>
  );
}
