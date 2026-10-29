"use client";

import { useState } from "react";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useTranslations } from "next-intl";

import { pageTitleClass } from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { isAdmin } from "@/features/auth/types";
import { openAuthModal, useAuth } from "@/features/auth/store";
import { AdminDataProvider, useReports } from "@/features/moderation/store";
import { useDealerVerified } from "@/features/moderation/visibility";
import { cn } from "@/lib/utils";

import { useAdminData, useListingAdmin } from "./shared";
import ApprovalsTab from "./tabs/ApprovalsTab";
import CollectionsTab from "./tabs/CollectionsTab";
import ListingsTab from "./tabs/ListingsTab";
import OverviewTab from "./tabs/OverviewTab";
import type { AdminTab } from "./types";
import ReportsTab from "./tabs/ReportsTab";
import UsersTab from "./tabs/UsersTab";

const TABS: AdminTab[] = ["overview", "approvals", "listings", "reports", "collections", "users"];

export default function AdminView() {
  const { user, loading } = useAuth();
  // данные модерации загружаются только для модератора
  if (loading) return <Skeleton className="max-w-3xl mx-auto my-10 h-80 rounded-panel bg-gray-50" />;
  return isAdmin(user) ? (
    <AdminDataProvider>
      <AdminPanel />
    </AdminDataProvider>
  ) : (
    <NoAccess />
  );
}

function AdminPanel() {
  const t = useTranslations("moderation.admin");
  const [tab, setTab] = useState<AdminTab>("overview");
  const [listingsQuery, setListingsQuery] = useState("");
  const counts = useTabCounts();
  const { loading } = useAdminData();

  return (
    <div className="pt-8 pb-16">
      <header className="flex items-center gap-4">
        <span className="w-14 h-14 shrink-0 flex items-center justify-center rounded-card bg-gray-900 text-white">
          <AdminPanelSettingsOutlinedIcon />
        </span>
        <div>
          <h1 className={pageTitleClass}>{t("title")}</h1>
          <p className="text-gray-500">{t("subtitle")}</p>
        </div>
      </header>

      <div className="mt-8 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-none">
        <div role="tablist" className="flex gap-1 p-1 w-fit rounded-xl bg-gray-100">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              onClick={() => setTab(item)}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition cursor-pointer",
                tab === item ? "bg-white text-gray-900 font-semibold shadow-sm" : "text-gray-600 hover:text-black"
              )}
            >
              {t(`tabs.${item}`)}
              {counts[item] > 0 && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
                  {counts[item]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {loading && <Skeleton className="h-64 rounded-card bg-gray-50" />}
        {!loading && tab === "overview" && <OverviewTab onOpen={setTab} />}
        {!loading && tab === "approvals" && <ApprovalsTab />}
        {!loading && tab === "listings" && <ListingsTab query={listingsQuery} onQueryChange={setListingsQuery} />}
        {!loading && tab === "reports" && <ReportsTab />}
        {!loading && tab === "collections" && <CollectionsTab />}
        {!loading && tab === "users" && (
          <UsersTab
            onShowListings={(name) => {
              setListingsQuery(name);
              setTab("listings");
            }}
          />
        )}
      </div>

    </div>
  );
}

// Счётчики задач на вкладках: сколько ждёт решения модератора
function useTabCounts(): Record<AdminTab, number> {
  const { statusKey } = useListingAdmin();
  const reports = useReports();
  const isVerified = useDealerVerified();
  const { listings, dealers } = useAdminData();

  return {
    overview: 0,
    listings: 0,
    approvals: listings.filter((l) => statusKey(l.id) === "pending").length,
    reports: reports.filter((r) => !r.resolved).length,
    collections: 0,
    users: dealers.filter((d) => !isVerified(d.slug)).length,
  };
}

function NoAccess() {
  const t = useTranslations("moderation.admin.noAccess");

  return (
    <div className="max-w-md mx-auto text-center py-20">
      <span className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-gray-100 text-gray-700 mb-5">
        <LockOutlinedIcon sx={{ fontSize: 30 }} />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-gray-500 mt-2">{t("text")}</p>
      <Button variant="dark" onClick={openAuthModal} className="mt-6 px-8">
        {t("login")}
      </Button>
    </div>
  );
}
