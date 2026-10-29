"use client";

import { useState } from "react";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useTranslations } from "next-intl";

import { isAdmin } from "@/features/auth/types";
import { openAuthModal, useAuth } from "@/features/auth/store";
import { useReports } from "@/features/moderation/store";
import { useDealerVerified } from "@/features/moderation/visibility";
import { cn } from "@/lib/utils";

import { useAdminData, useListingAdmin } from "./shared";
import ApprovalsTab from "./tabs/ApprovalsTab";
import CollectionsTab from "./tabs/CollectionsTab";
import ListingsTab from "./tabs/ListingsTab";
import OverviewTab, { AdminTab } from "./tabs/OverviewTab";
import ReportsTab from "./tabs/ReportsTab";
import UsersTab from "./tabs/UsersTab";

const TABS: AdminTab[] = ["overview", "approvals", "listings", "reports", "collections", "users"];

export default function AdminView() {
  const t = useTranslations("moderation.admin");
  const { user } = useAuth();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [listingsQuery, setListingsQuery] = useState("");
  const counts = useTabCounts();

  if (!isAdmin(user)) return <NoAccess />;

  return (
    <div className="pt-8 pb-16">
      <header className="flex items-center gap-4">
        <span className="w-14 h-14 shrink-0 flex items-center justify-center rounded-2xl bg-gray-900 text-white">
          <AdminPanelSettingsOutlinedIcon />
        </span>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{t("title")}</h1>
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
        {tab === "overview" && <OverviewTab onOpen={setTab} />}
        {tab === "approvals" && <ApprovalsTab />}
        {tab === "listings" && <ListingsTab query={listingsQuery} onQueryChange={setListingsQuery} />}
        {tab === "reports" && <ReportsTab />}
        {tab === "collections" && <CollectionsTab />}
        {tab === "users" && (
          <UsersTab
            onShowListings={(name) => {
              setListingsQuery(name);
              setTab("listings");
            }}
          />
        )}
      </div>

      <p className="text-xs text-gray-500 mt-10">{t("demo")}</p>
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
      <button
        type="button"
        onClick={openAuthModal}
        className="mt-6 h-11 px-8 rounded-full bg-gray-900 hover:bg-black text-white text-sm font-semibold transition cursor-pointer"
      >
        {t("login")}
      </button>
    </div>
  );
}
