"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Snackbar } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CloudOffOutlinedIcon from "@mui/icons-material/CloudOffOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useLocale, useTranslations } from "next-intl";

import { openAuthModal, useAuth } from "@/features/auth/store";
import PhoneButton from "@/features/cars/car-list/components/PhoneButton";
import { inputClass } from "@/features/cars/car-list/components/ui";
import { Listing, listings } from "@/features/cars/data/listings";
import CollectionPills from "@/features/collections/components/CollectionPills";
import CarCard from "@/features/latest-cars/components/CarCard";
import { Link } from "@/i18n/navigation";
import { useNow } from "@/lib/useNow";
import { formatAgo, formatNumber } from "@/lib/utils";

import { FavoriteEntry, addFavorite, clearFavorites, removeFavorite, useFavorites } from "../store";

const SORTS = ["added", "price_asc", "price_desc"] as const;
type Sort = (typeof SORTS)[number];

// true только в браузере после гидратации — до этого избранное ещё не прочитано
const noop = () => () => {};
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

type Undo = { message: string; entries: FavoriteEntry[] };

export default function FavoritesView() {
  const t = useTranslations("favorites");
  const tCommon = useTranslations("common");
  const hydrated = useHydrated();
  const { entries } = useFavorites();
  const { isLoggedIn } = useAuth();
  const now = useNow();

  const [sort, setSort] = useState<Sort>("added");
  const [undo, setUndo] = useState<Undo | null>(null);

  const items = entries.map((entry) => ({ entry, listing: listings.find((l) => l.id === entry.id) }));

  const sorted = [...items].sort((a, b) => {
    if (sort === "added") return b.entry.addedAt - a.entry.addedAt;
    // снятые с продажи — в конце
    if (!a.listing || !b.listing) return a.listing ? -1 : 1;
    return sort === "price_asc" ? a.listing.price - b.listing.price : b.listing.price - a.listing.price;
  });

  const remove = (entry: FavoriteEntry) => {
    removeFavorite(entry.id);
    setUndo({ message: t("removed"), entries: [entry] });
  };

  const clear = () => {
    setUndo({ message: t("cleared"), entries });
    clearFavorites();
  };

  const restore = () => {
    // добавляем в обратном порядке, чтобы сохранился исходный порядок
    undo?.entries.toReversed().forEach(addFavorite);
    setUndo(null);
  };

  return (
    <div className="pt-6 pb-16">
      {/* Header */}

      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{t("title")}</h1>
          {hydrated && entries.length > 0 && (
            <p className="text-gray-500 mt-1">{tCommon("listings", { count: entries.length })}</p>
          )}
        </div>

        {entries.length > 1 && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                aria-label={t("sort.label")}
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className={`${inputClass} appearance-none pr-9 cursor-pointer w-auto`}
              >
                {SORTS.map((value) => (
                  <option key={value} value={value}>
                    {t(`sort.${value}`)}
                  </option>
                ))}
              </select>
              <KeyboardArrowDownIcon
                fontSize="small"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>

            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <DeleteOutlineIcon fontSize="small" />
              {t("clear")}
            </button>
          </div>
        )}
      </div>

      {!hydrated ? (
        <Skeleton />
      ) : entries.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Гостю — напоминание, что избранное живёт только в этом браузере */}
          {!isLoggedIn && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 p-4 rounded-2xl bg-gray-50 text-sm">
              <CloudOffOutlinedIcon className="text-gray-400 shrink-0" />
              <p className="flex-1 text-gray-700">{t("guest.text")}</p>
              <button
                type="button"
                onClick={openAuthModal}
                className="self-start sm:self-auto shrink-0 h-10 px-5 rounded-full bg-gray-900 hover:bg-black text-white font-medium transition cursor-pointer"
              >
                {t("guest.login")}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sorted.map(({ entry, listing }) =>
              listing ? (
                <FavoriteCard key={entry.id} listing={listing} entry={entry} now={now} onRemove={() => remove(entry)} />
              ) : (
                <UnavailableCard key={entry.id} onRemove={() => remove(entry)} />
              )
            )}
          </div>
        </>
      )}

      <Snackbar
        open={Boolean(undo)}
        autoHideDuration={5000}
        onClose={(_, reason) => reason !== "clickaway" && setUndo(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message={undo?.message}
        action={
          <button
            type="button"
            onClick={restore}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white hover:bg-white/10 cursor-pointer"
          >
            {t("undo")}
          </button>
        }
      />
    </div>
  );
}

/* ---------- Карточки ---------- */

const cardClass = "relative min-w-0 flex gap-3 sm:gap-4 p-3 rounded-2xl border border-gray-200 bg-white";

function RemoveButton({ onClick }: { onClick: () => void }) {
  const t = useTranslations("favorites");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("remove")}
      title={t("remove")}
      className="relative z-10 w-10 h-10 shrink-0 flex items-center justify-center rounded-full hover:bg-gray-100 transition cursor-pointer"
    >
      <FavoriteIcon fontSize="small" className="text-primary" />
    </button>
  );
}

function FavoriteCard({
  listing,
  entry,
  now,
  onRemove,
}: {
  listing: Listing;
  entry: FavoriteEntry;
  now: number | null;
  onRemove: () => void;
}) {
  const t = useTranslations("favorites");
  const tCommon = useTranslations("common");
  const tOptions = useTranslations("options");
  const locale = useLocale();

  const image = listing.images[0];
  const href = `/listing/${listing.id}`;
  const diff = listing.price - entry.price; // < 0 — подешевело с момента добавления
  const added = now === null ? null : Math.round((now - entry.addedAt) / 60_000); // минут назад

  return (
    <article className={`group ${cardClass} hover:border-gray-300 hover:shadow-lg hover:shadow-black/5 transition`}>
      <div className="relative w-32 sm:w-44 aspect-[4/3] shrink-0 rounded-xl overflow-hidden bg-gray-100">
        {image ? (
          <Image src={image} alt={listing.title} fill sizes="176px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <DirectionsCarOutlinedIcon sx={{ fontSize: 36 }} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {/* ссылка растянута на всю карточку через after: */}
            <Link href={href} className="after:absolute after:inset-0 after:rounded-2xl">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary transition">
                {listing.title}
              </h3>
            </Link>

            <div className="flex flex-wrap items-baseline gap-x-2 mt-0.5">
              <span className="text-lg font-semibold">{formatNumber(listing.price)} €</span>
              {diff < 0 && (
                <span className="text-sm text-gray-400 line-through">{formatNumber(entry.price)} €</span>
              )}
            </div>
          </div>

          <RemoveButton onClick={onRemove} />
        </div>

        {diff < 0 && (
          <span className="self-start inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
            <TrendingDownIcon sx={{ fontSize: 15 }} />
            {t("priceDropped", { amount: formatNumber(-diff) })}
          </span>
        )}

        <div className="text-sm text-gray-500 mt-1 truncate">
          {listing.year} · {formatNumber(listing.mileage)} {tCommon("units.km")} · {tOptions(`fuel.${listing.fuel}`)} ·{" "}
          {tOptions(`transmission.${listing.transmission}`)}
        </div>

        <div className="mt-auto pt-2 flex flex-wrap items-end justify-between gap-2">
          <div className="text-xs text-gray-500">
            {tOptions(`cities.${listing.city}`)}
            {added !== null && (
              <> · {added < 1 ? t("addedJustNow") : t("added", { ago: formatAgo(added, locale) })}</>
            )}
          </div>

          <div className="hidden sm:block">
            <PhoneButton phone={listing.phone} />
          </div>
        </div>
      </div>
    </article>
  );
}

function UnavailableCard({ onRemove }: { onRemove: () => void }) {
  const t = useTranslations("favorites");

  return (
    <article className={`${cardClass} bg-gray-50`}>
      <div className="w-32 sm:w-44 aspect-[4/3] shrink-0 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300">
        <DirectionsCarOutlinedIcon sx={{ fontSize: 36 }} />
      </div>

      <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-500">{t("unavailable.title")}</h3>
          <p className="text-sm text-gray-500 mt-1">{t("unavailable.text")}</p>
        </div>

        <RemoveButton onClick={onRemove} />
      </div>
    </article>
  );
}

/* ---------- Пустое состояние и загрузка ---------- */

function EmptyState() {
  const t = useTranslations("favorites");
  const suggested = [...listings].sort((a, b) => a.postedMinutesAgo - b.postedMinutesAgo).slice(0, 4);

  return (
    <div>
      <div className="text-center py-12 px-6 rounded-3xl bg-gray-50">
        <span className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-white shadow-sm">
          <FavoriteIcon className="text-primary" sx={{ fontSize: 30 }} />
        </span>
        <h2 className="text-xl font-semibold mt-4">{t("empty.title")}</h2>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">{t("empty.text")}</p>

        <Link
          href="/cars"
          className="inline-flex items-center h-12 px-6 mt-6 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold transition"
        >
          {t("empty.cta")}
        </Link>

        <div className="mt-8 flex justify-center">
          <CollectionPills />
        </div>
      </div>

      <h2 className="text-xl font-semibold tracking-tight mt-12 mb-5">{t("empty.suggested")}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8">
        {suggested.map((listing) => (
          <CarCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`${cardClass} animate-pulse`}>
          <div className="w-32 sm:w-44 aspect-[4/3] rounded-xl bg-gray-100" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-2/3 rounded bg-gray-100" />
            <div className="h-5 w-1/3 rounded bg-gray-100" />
            <div className="h-3 w-1/2 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
