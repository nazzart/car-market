"use client";

// /account: кабинет — шапка, уведомления, статистика, свои объявления по статусам, боковая колонка
import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import StatTile from "@/components/ui/StatTile";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/features/auth/store";
import type { Listing } from "@/features/cars/types";
import VerifiedBadge from "@/features/dealers/components/VerifiedBadge";
import { isProfileComplete } from "@/features/dealers/lib/listed";
import { useOwnDealer } from "@/features/dealers/useOwnDealer";
import { useVisibility } from "@/features/moderation/visibility";
import { formatNumber, initials } from "@/lib/utils";

import AccountNotices from "./AccountNotices";
import AccountSidebar from "./AccountSidebar";
import AccountListingRow, { favoritesOf, phoneShows } from "./listings/AccountListingRow";
import type { ListingStatus } from "./listings/status";
import LoggedOut from "./LoggedOut";
import { useOwnListings } from "./useOwnListings";

// Вкладки = статусы объявлений (удалённые не показываем); «pending» и «blocked» — только если есть такие
const tabs = ["active", "pending", "paused", "sold", "blocked"] as const;
type Tab = (typeof tabs)[number];

export default function AccountView() {
  const t = useTranslations("account");
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("active");
  const { of } = useVisibility();
  const toast = useToast();
  const dealer = useOwnDealer();
  // новый дилер без адреса и телефона покупателям не виден — подсказываем заполнить профиль
  const dealerIncomplete = dealer !== null && !isProfileComplete(dealer);
  // у дилера город — из адреса его страницы, у частного лица — из профиля
  const shownCity = dealer ? (dealerIncomplete ? undefined : dealer.city) : user?.city;
  const { listings: ownListings, setStatus } = useOwnListings(); // undefined — ещё загружаются

  if (!user) return <LoggedOut />;

  const isDealer = user.type === "dealer";
  const all = (ownListings ?? []).filter((l) => l.status !== "deleted");
  const tabOf = (listing: Listing): Tab => {
    const v = of(listing);
    if (v.moderation) return "blocked";
    if (v.pending) return "pending";
    return listing.status as Tab;
  };
  const byStatus = (s: Tab) => all.filter((l) => tabOf(l) === s);
  const visibleTabs = tabs.filter((item) => !["pending", "blocked"].includes(item) || byStatus(item).length > 0);
  // статистика — только по активным
  const own = byStatus("active");
  const shown = byStatus(tab);

  const changeStatus = (listing: Listing, next: ListingStatus) => {
    setStatus(listing.id, next);
    const prev = listing.status;
    toast({ message: t(`actions.done.${next}`), action: { label: t("actions.undo"), onClick: () => setStatus(listing.id, prev) } });
  };

  const totalViews = own.reduce((sum, l) => sum + (l.views ?? 0), 0);
  const totalPhone = own.reduce((sum, l) => sum + phoneShows(l), 0);
  const totalFavorites = own.reduce((sum, l) => sum + favoritesOf(l), 0);

  const stats = [
    {
      label: t("stats.active", { count: own.length }),
      value: own.length,
      icon: DirectionsCarOutlinedIcon,
    },
    { label: t("stats.views", { count: totalViews }), value: totalViews, icon: VisibilityOutlinedIcon },
    { label: t("stats.phone", { count: totalPhone }), value: totalPhone, icon: PhoneOutlinedIcon },
    { label: t("stats.favorites", { count: totalFavorites }), value: totalFavorites, icon: FavoriteBorderIcon },
  ];

  return (
    <div className="pt-8 pb-16">
      {/* Header */}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <span
            className={`w-16 h-16 shrink-0 flex items-center justify-center bg-gray-900 text-white text-xl font-bold ${
              isDealer ? "rounded-2xl" : "rounded-full"
            }`}
          >
            {initials(user.name)}
          </span>

          <div className="min-w-0">
            <p className="text-sm text-gray-500">{isDealer ? t("header.dealerCabinet") : t("header.cabinet")}</p>
            <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-semibold tracking-tight">
              {isDealer ? user.name : t("header.hello", { name: user.name.split(" ")[0] })}
              {isDealer && user.dealerSlug && <VerifiedBadge slug={user.dealerSlug} size={24} />}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {dealer?.slug && !dealerIncomplete && (
            <Button variant="outline" href={`/dealers/${dealer.slug}`} icon={<StorefrontOutlinedIcon sx={{ fontSize: 18 }} />}>
              {t("header.publicPage")}
            </Button>
          )}

          <Button href="/sell" icon={<AddIcon sx={{ fontSize: 18 }} />}>
            {t("header.post")}
          </Button>
        </div>
      </header>

      {/* Решения модератора — заметно, с причиной */}
      <AccountNotices
        user={user}
        dealerIncomplete={dealerIncomplete}
        blockedCount={byStatus("blocked").length}
        pendingCount={byStatus("pending").length}
        onShow={setTab}
      />

      {/* Stats */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
        {stats.map(({ label, value, icon }) => (
          <StatTile key={label} icon={icon} value={formatNumber(value)} label={label} />
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">{t("stats.period")}</p>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8 mt-10 items-start">
        {/* Listings */}

        <section className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold tracking-tight">
              {isDealer ? t("listings.dealer") : t("listings.mine")}
            </h2>

            <div className="flex p-1 rounded-xl bg-gray-100">
              {visibleTabs.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={tab === item}
                  onClick={() => setTab(item)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition cursor-pointer ${
                    tab === item ? "bg-white text-gray-900 font-medium shadow-sm" : "text-gray-600 hover:text-black"
                  }`}
                >
                  {t(`tabs.${item}`)}
                  <span className="ml-1 text-gray-400">{byStatus(item).length}</span>
                </button>
              ))}
            </div>
          </div>

          {ownListings === undefined ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="h-28 rounded-2xl bg-gray-50" />
              ))}
            </div>
          ) : shown.length > 0 ? (
            <div className="space-y-3">
              {shown.map((l) => (
                <AccountListingRow
                  key={l.id}
                  listing={l}
                  status={l.status}
                  moderation={l.moderation}
                  pending={tabOf(l) === "pending"}
                  onStatusChange={(next) => changeStatus(l, next)}
                />
              ))}
            </div>
          ) : (
            <EmptyState icon={DirectionsCarOutlinedIcon} text={t(`listings.empty.${tab}`)} />
          )}
        </section>

        <AccountSidebar user={user} dealer={dealer} shownCity={shownCity} />
      </div>

    </div>
  );
}
