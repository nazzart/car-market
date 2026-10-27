"use client";

import { useState } from "react";
import Image from "next/image";
import AddIcon from "@mui/icons-material/Add";
import VerifiedIcon from "@mui/icons-material/Verified";
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
import { User } from "@/features/auth/data/demoUsers";
import { openAuthModal, useAuth } from "@/features/auth/store";
import { Listing, listings } from "@/features/cars/data/listings";
import { dealers, formatHours } from "@/features/dealers/data/dealers";
import { Link } from "@/i18n/navigation";
import { formatAgo, formatNumber, initials } from "@/lib/utils";

// Пока статистики нет — считаем примерные значения от просмотров
const phoneShows = (l: Listing) => Math.round((l.views ?? 0) * 0.12);
const favorites = (l: Listing) => Math.round((l.views ?? 0) * 0.05);

const userListings = (user: User) =>
  user.type === "dealer"
    ? listings.filter((l) => l.dealer === user.dealerSlug)
    : listings.filter((l) => user.listingIds?.includes(l.id));

const tabs = [
  { value: "active" },
  { value: "draft" },
  { value: "sold" },
];

const primaryButton =
  "inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition";

const secondaryButton =
  "inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-full border border-gray-200 hover:border-gray-900 text-sm font-medium text-gray-900 transition";

function LoggedOut() {
  const t = useTranslations("account.loggedOut");

  return (
    <div className="max-w-md mx-auto text-center py-20">
      <span className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-gray-100 text-gray-700 mb-5">
        <LockOutlinedIcon sx={{ fontSize: 30 }} />
      </span>

      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
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

function ListingRow({ listing }: { listing: Listing }) {
  const t = useTranslations("account.row");
  const locale = useLocale();

  return (
    <div className="flex gap-4 p-3 rounded-2xl border border-gray-200">
      <div className="relative w-28 sm:w-36 aspect-[4/3] shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
        {listing.images[0] ? (
          <Image src={listing.images[0]} alt={listing.title} fill sizes="144px" className="object-cover" />
        ) : (
          <DirectionsCarOutlinedIcon className="text-gray-300" />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
              {t("active")}
            </span>
            <span className="text-xs text-gray-500">{formatAgo(listing.postedMinutesAgo, locale)}</span>
          </div>

          <div className="font-semibold text-gray-900 truncate mt-1">
            {listing.title}, {listing.year}
          </div>
          <div className="font-bold text-gray-900">{formatNumber(listing.price)} €</div>

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

        <Link href={`/listing/${listing.id}`} className={`${secondaryButton} h-9 px-4 self-start sm:self-auto`}>
          {t("open")}
        </Link>
      </div>
    </div>
  );
}

export default function AccountView() {
  const t = useTranslations("account");
  const tOptions = useTranslations("options");
  const { user } = useAuth();
  const [tab, setTab] = useState("active");

  if (!user) return <LoggedOut />;

  const isDealer = user.type === "dealer";
  const dealer = dealers.find((d) => d.slug === user.dealerSlug);
  const own = userListings(user);
  const shown = tab === "active" ? own : [];

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
              {isDealer && <VerifiedIcon className="text-sky-600" titleAccess={t("header.verified")} />}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isDealer && dealer && (
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

      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-8 mt-10 items-start">
        {/* Listings */}

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold tracking-tight">
              {isDealer ? t("listings.dealer") : t("listings.mine")}
            </h2>

            <div className="flex p-1 rounded-xl bg-gray-100">
              {tabs.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={tab === item.value}
                  onClick={() => setTab(item.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition cursor-pointer ${
                    tab === item.value ? "bg-white text-gray-900 font-medium shadow-sm" : "text-gray-600 hover:text-black"
                  }`}
                >
                  {t(`tabs.${item.value}`)}
                  <span className="ml-1 text-gray-400">{item.value === "active" ? own.length : 0}</span>
                </button>
              ))}
            </div>
          </div>

          {shown.length > 0 ? (
            <div className="space-y-3">
              {shown.map((l) => (
                <ListingRow key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <div className="text-center py-14 px-6 rounded-2xl border border-dashed border-gray-200">
              <DirectionsCarOutlinedIcon sx={{ fontSize: 44 }} className="text-gray-300" />
              <p className="text-gray-500 mt-2">{t("listings.empty")}</p>
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
                <dd className="text-gray-900 text-right">{tOptions(`cities.${user.city}`)}</dd>
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

          {isDealer && dealer && (
            <div className="rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold mb-3">{t("profile.dealerCenter")}</h3>

              <div className="space-y-2 text-sm text-gray-800">
                <div className="flex items-start gap-2">
                  <PlaceOutlinedIcon sx={{ fontSize: 18 }} className="text-gray-500" />
                  {dealer.address}, {tOptions(`cities.${dealer.city}`)}
                </div>
                <div className="flex items-start gap-2">
                  <ScheduleOutlinedIcon sx={{ fontSize: 18 }} className="text-gray-500" />
                  {formatHours(dealer.hours, (d) => tOptions(`days.${d}`))}
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
    </div>
  );
}
