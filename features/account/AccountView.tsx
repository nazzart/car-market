"use client";

import { useState } from "react";
import BlockIcon from "@mui/icons-material/Block";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { Snackbar } from "@mui/material";
import Image from "next/image";
import AddIcon from "@mui/icons-material/Add";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { useLocale, useTranslations } from "next-intl";

import { brands } from "@/features/brands/data/brands";
import { usePlaceName } from "@/lib/places";
import { openAuthModal, useAuth } from "@/features/auth/store";
import { Listing } from "@/features/cars/types";
import { useDealerListingsOf, useUserListings } from "@/features/cars/hooks";
import OpenStatus from "@/features/dealers/components/OpenStatus";
import VerifiedBadge from "@/features/dealers/components/VerifiedBadge";
import { formatHours } from "@/features/dealers/lib/hours";
import { useOwnDealer } from "@/features/dealers/useOwnDealer";
import { Link } from "@/i18n/navigation";

import { accountOfUser } from "@/features/moderation/accounts";
import { Moderation, useBlockedAccounts, useModeration } from "@/features/moderation/store";
import { useVisibility } from "@/features/moderation/visibility";

import ListingActions from "./listings/ListingActions";
import { ListingStatus, setListingStatus, statusOf, useListingStatuses } from "./listings/statusStore";
import { formatAgo, formatNumber, initials } from "@/lib/utils";

// Пока статистики нет — считаем примерные значения от просмотров
const phoneShows = (l: Listing) => Math.round((l.views ?? 0) * 0.12);
const favorites = (l: Listing) => Math.round((l.views ?? 0) * 0.05);

// Вкладки = статусы объявлений (удалённые не показываем); «pending» и «blocked» — только если есть такие
const tabs = ["active", "pending", "paused", "sold", "blocked"] as const;
type Tab = (typeof tabs)[number];

const statusBadge: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-800",
  paused: "bg-gray-100 text-gray-600",
  sold: "bg-sky-50 text-sky-700",
  blocked: "bg-red-50 text-red-700",
};

const primaryButton =
  "inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition";

const secondaryButton =
  "inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-full border border-gray-200 hover:border-gray-900 text-sm font-medium text-gray-900 transition";

// title — заголовок страницы, на которую пытались попасть (например, «Настройки профиля»)
export function LoggedOut({ title }: { title?: string }) {
  const t = useTranslations("account.loggedOut");

  return (
    <div className="max-w-md mx-auto text-center py-20">
      <span className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-gray-100 text-gray-700 mb-5">
        <LockOutlinedIcon sx={{ fontSize: 30 }} />
      </span>

      <h1 className="text-2xl font-semibold tracking-tight">{title ?? t("title")}</h1>
      <p className="text-gray-500 mt-2">
        {t("text")}
      </p>

      <button type="button" onClick={openAuthModal} className={`${primaryButton} mt-6 px-8 cursor-pointer`}>
        {t("login")}
      </button>

      <p className="text-xs text-gray-500 mt-4">
        {t("demo")}
      </p>
    </div>
  );
}

function ListingRow({
  listing,
  status,
  moderation,
  pending,
  onStatusChange,
}: {
  listing: Listing;
  status: ListingStatus;
  moderation?: Moderation;
  pending?: boolean;
  onStatusChange: (status: ListingStatus) => void;
}) {
  const t = useTranslations("account.row");
  const tReasons = useTranslations("moderation.reasons");
  const locale = useLocale();
  const badge = moderation ? "blocked" : pending ? "pending" : status;

  return (
    <div className={`flex gap-4 p-3 rounded-2xl border border-gray-200 ${status === "active" ? "" : "bg-gray-50/60"}`}>
      <div className="relative w-28 sm:w-36 aspect-[4/3] shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
        {listing.images[0] ? (
          <Image
            src={listing.images[0]}
            alt={listing.title}
            fill
            sizes="144px"
            className={`object-cover ${status === "active" ? "" : "grayscale opacity-70"}`}
          />
        ) : (
          <DirectionsCarOutlinedIcon className="text-gray-300" />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusBadge[badge]}`}>
              {t(`status.${badge}`)}
            </span>
            <span className="text-xs text-gray-500">{formatAgo(listing.postedMinutesAgo, locale)}</span>
          </div>

          <div className="font-semibold text-gray-900 truncate mt-1">
            {listing.title}, {listing.year}
          </div>
          <div className="font-bold text-gray-900">{formatNumber(listing.price)} €</div>

          {/* продавцу — причина блокировки */}
          {moderation && (
            <p className="mt-1.5 text-xs text-red-700">
              {t("blockedReason", { reason: tReasons(moderation.reason) })}
              {moderation.note && ` — ${moderation.note}`}
            </p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <VisibilityOutlinedIcon sx={{ fontSize: 14 }} />
              {formatNumber(listing.views ?? 0)}
            </span>
            <span className="inline-flex items-center gap-1">
              <PhoneOutlinedIcon sx={{ fontSize: 14 }} />
              {formatNumber(phoneShows(listing))}
            </span>
            <span className="inline-flex items-center gap-1">
              <FavoriteBorderIcon sx={{ fontSize: 14 }} />
              {formatNumber(favorites(listing))}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link href={`/listing/${listing.id}`} className={`${secondaryButton} h-9 px-4`}>
            {t("open")}
          </Link>
          {/* заблокированное модератором продавец не может снова активировать */}
          {!moderation && !pending && <ListingActions title={listing.title} status={status} onChange={onStatusChange} />}
        </div>
      </div>
    </div>
  );
}

function Notice({
  tone,
  title,
  children,
  action,
}: {
  tone: "red" | "amber";
  title: string;
  children: React.ReactNode;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border ${
        tone === "red" ? "bg-red-50 border-red-100 text-red-900" : "bg-amber-50 border-amber-100 text-amber-900"
      }`}
    >
      {tone === "red" ? <BlockIcon className="shrink-0" /> : <HourglassEmptyIcon className="shrink-0" />}
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm">{children}</div>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="shrink-0 h-10 px-4 rounded-full bg-white border border-gray-200 hover:border-gray-900 text-sm font-semibold text-gray-900 transition cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default function AccountView() {
  const t = useTranslations("account");
  const tReasons = useTranslations("moderation.reasons");
  const tOptions = useTranslations("options");
  const placeName = usePlaceName();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("active");
  const statuses = useListingStatuses();
  const moderation = useModeration();
  const { of } = useVisibility();
  const blockedAccounts = useBlockedAccounts();
  const [undo, setUndo] = useState<{ id: string; prev: ListingStatus; next: ListingStatus } | null>(null);
  // каталог дилеров + изменения из настроек
  const dealer = useOwnDealer();
  const dealerListings = useDealerListingsOf(dealer ? user?.dealerSlug : undefined);
  const privateListings = useUserListings(dealer ? undefined : user?.id);

  if (!user) return <LoggedOut />;

  const isDealer = user.type === "dealer";
  const ownListings = dealer ? dealerListings : privateListings; // undefined — ещё загружаются
  const all = (ownListings ?? []).filter((l) => statusOf(statuses, l.id) !== "deleted");
  const tabOf = (listing: Listing): Tab => {
    const v = of(listing);
    if (v.moderation) return "blocked";
    if (v.pending) return "pending";
    return statusOf(statuses, listing.id) as Tab;
  };
  const byStatus = (s: Tab) => all.filter((l) => tabOf(l) === s);
  const visibleTabs = tabs.filter((item) => !["pending", "blocked"].includes(item) || byStatus(item).length > 0);
  const accountBlock = blockedAccounts[accountOfUser(user)];
  const blockedCount = byStatus("blocked").length;
  const pendingCount = byStatus("pending").length;
  // статистика — только по активным
  const own = byStatus("active");
  const shown = byStatus(tab);

  const changeStatus = (id: string, next: ListingStatus) => {
    const prev = statusOf(statuses, id);
    setListingStatus(id, next);
    setUndo({ id, prev, next });
  };

  const totalViews = own.reduce((sum, l) => sum + (l.views ?? 0), 0);
  const totalPhone = own.reduce((sum, l) => sum + phoneShows(l), 0);
  const totalFavorites = own.reduce((sum, l) => sum + favorites(l), 0);

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
          {dealer?.slug && (
            <Link href={`/dealers/${dealer.slug}`} className={secondaryButton}>
              <StorefrontOutlinedIcon sx={{ fontSize: 18 }} />
              {t("header.publicPage")}
            </Link>
          )}

          <Link href="/sell" className={primaryButton}>
            <AddIcon sx={{ fontSize: 18 }} />
            {t("header.post")}
          </Link>
        </div>
      </header>

      {/* Решения модератора — заметно, с причиной */}
      <div className="space-y-3 mt-6 empty:hidden">
        {accountBlock && (
          <Notice tone="red" title={t("notices.accountTitle")}>
            {t("notices.accountText", { reason: tReasons(accountBlock.reason) })}
            {accountBlock.note && <> — {accountBlock.note}</>}
          </Notice>
        )}
        {!accountBlock && blockedCount > 0 && (
          <Notice
            tone="red"
            title={t("notices.blockedTitle", { count: blockedCount })}
            action={{ label: t("notices.show"), onClick: () => setTab("blocked") }}
          >
            {t("notices.blockedText")}
          </Notice>
        )}
        {pendingCount > 0 && (
          <Notice
            tone="amber"
            title={t("notices.pendingTitle", { count: pendingCount })}
            action={{ label: t("notices.show"), onClick: () => setTab("pending") }}
          >
            {t("notices.pendingText")}
          </Notice>
        )}
      </div>

      {/* Stats */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="p-4 rounded-2xl bg-gray-50">
            <Icon fontSize="small" className="text-gray-500" />
            <div className="text-2xl font-semibold tracking-tight mt-2">{formatNumber(value)}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
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
                <div key={i} className="h-28 rounded-2xl bg-gray-50 animate-pulse" />
              ))}
            </div>
          ) : shown.length > 0 ? (
            <div className="space-y-3">
              {shown.map((l) => (
                <ListingRow
                  key={l.id}
                  listing={l}
                  status={statusOf(statuses, l.id)}
                  moderation={moderation[l.id]}
                  pending={tabOf(l) === "pending"}
                  onStatusChange={(next) => changeStatus(l.id, next)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-14 px-6 rounded-2xl border border-dashed border-gray-200">
              <DirectionsCarOutlinedIcon sx={{ fontSize: 44 }} className="text-gray-300" />
              <p className="text-gray-500 mt-2">{t(`listings.empty.${tab}`)}</p>
            </div>
          )}
        </section>

        {/* Sidebar */}

        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold mb-3">{isDealer ? t("profile.company") : t("profile.title")}</h3>

            <dl className="space-y-2 text-sm">
              {!isDealer && (
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">{t("profile.name")}</dt>
                  <dd className="text-gray-900 text-right">{user.name}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">{t("profile.email")}</dt>
                <dd className="text-gray-900 text-right truncate">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">{t("profile.phone")}</dt>
                <dd className="text-gray-900 text-right">{user.phone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">{t("profile.city")}</dt>
                <dd className="text-gray-900 text-right">{placeName(user.city)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">{t("profile.since")}</dt>
                <dd className="text-gray-900 text-right">{user.since}</dd>
              </div>
            </dl>

            <Link href="/account/profile" className={`${secondaryButton} w-full mt-5`}>
              {t("profile.edit")}
            </Link>
          </div>

          {dealer?.address && (
            <div className="rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold mb-3">{t("profile.dealerCenter")}</h3>

              <div className="space-y-2 text-sm text-gray-800">
                <div className="flex items-start gap-2">
                  <PlaceOutlinedIcon sx={{ fontSize: 18 }} className="text-gray-500" />
                  {dealer.address}, {placeName(dealer.city)}
                </div>
                <div className="flex items-start gap-2">
                  <ScheduleOutlinedIcon sx={{ fontSize: 18 }} className="text-gray-500" />
                  <div>
                    <OpenStatus hours={dealer.hours} />
                    <div className="text-xs text-gray-500">{formatHours(dealer.hours, (d) => tOptions(`days.${d}`))}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {dealer.brands.map((b) => (
                  <span key={b} className="px-2 py-0.5 rounded-md bg-gray-100 text-xs font-medium text-gray-700">
                    {brands.find((brand) => brand.slug === b)?.name ?? b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!isDealer && (
            <div className="flex gap-3 rounded-2xl bg-gray-50 p-5 text-sm text-gray-700">
              <MailOutlineIcon fontSize="small" className="text-gray-500 shrink-0" />
              {t("profile.tip")}
            </div>
          )}
        </aside>
      </div>

      <Snackbar
        open={Boolean(undo)}
        autoHideDuration={5000}
        onClose={(_, reason) => reason !== "clickaway" && setUndo(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message={undo && t(`actions.done.${undo.next}`)}
        action={
          <button
            type="button"
            onClick={() => {
              if (undo) setListingStatus(undo.id, undo.prev);
              setUndo(null);
            }}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white hover:bg-white/10 cursor-pointer"
          >
            {t("actions.undo")}
          </button>
        }
      />
    </div>
  );
}
