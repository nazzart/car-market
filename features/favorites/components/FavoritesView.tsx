"use client";

import { useState, useSyncExternalStore } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useLocale, useTranslations } from "next-intl";

import MetaLine from "@/components/ui/MetaLine";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import CarPhoto from "@/components/ui/CarPhoto";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { openAuthModal, useAuth } from "@/features/auth/store";
import ListingPhone from "@/features/cars/car-view/components/ListingPhone";
import { inputClass } from "@/components/ui/form";
import { Listing } from "@/features/cars/types";
import { useLatestListings, useListingsByIds } from "@/features/cars/hooks";
import { useSpecLine } from "@/features/cars/lib/useSpecLine";
import { useVisibility } from "@/features/moderation/visibility";
import CollectionPills from "@/features/collections/components/CollectionPills";
import CarCard from "@/features/latest-cars/components/CarCard";
import { Link } from "@/i18n/navigation";
import { useNow } from "@/lib/useNow";
import { formatAgo, formatNumber, formatPrice } from "@/lib/utils";

import CompareButton from "@/features/compare/components/CompareButton";
import { usePlaceName } from "@/lib/places";

import { FavoriteEntry, addFavorite, clearFavorites, removeFavorite, useFavorites } from "../store";

const SORTS = ["added", "price_asc", "price_desc"] as const;
type Sort = (typeof SORTS)[number];

// true только в браузере после гидратации — до этого избранное ещё не прочитано
const noop = () => () => {};
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);


export default function FavoritesView() {
  const t = useTranslations("favorites");
  const tCommon = useTranslations("common");
  const hydrated = useHydrated();
  const { entries, ready } = useFavorites();
  const { isLoggedIn, loading } = useAuth();
  const now = useNow();
  // с сервера — только объявления из избранного; undefined — ещё загружаются
  const loaded = useListingsByIds(entries.map((e) => e.id));
  const listingOf = (id: string) => loaded?.find((l) => l.id === id);

  const [sort, setSort] = useState<Sort>("added");
  const toast = useToast();

  const items = entries.map((entry) => ({ entry, listing: listingOf(entry.id) }));

  const sorted = [...items].sort((a, b) => {
    if (sort === "added") return b.entry.addedAt - a.entry.addedAt;
    // снятые с продажи — в конце
    if (!a.listing || !b.listing) return a.listing ? -1 : 1;
    return sort === "price_asc" ? a.listing.price - b.listing.price : b.listing.price - a.listing.price;
  });

  // «Удалено — Отменить»: возвращаем в обратном порядке, чтобы сохранился исходный порядок
  const offerUndo = (message: string, removed: FavoriteEntry[]) =>
    toast({ message, action: { label: t("undo"), onClick: () => removed.toReversed().forEach(addFavorite) } });

  const remove = (entry: FavoriteEntry) => {
    removeFavorite(entry.id);
    offerUndo(t("removed"), [entry]);
  };

  const clear = () => {
    offerUndo(t("cleared"), entries);
    clearFavorites();
  };

  return (
    <div className="pt-6 pb-16">
      {/* Header */}

      <PageHeader
        title={t("title")}
        subtitle={hydrated && entries.length > 0 && tCommon("listings", { count: entries.length })}
        actions={
          entries.length > 1 && (
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

                <Button variant="ghost" onClick={clear} icon={<DeleteOutlineIcon fontSize="small" />}>
                  {t("clear")}
                </Button>
              </div>
          )
        }
      />

      {!hydrated || loading || !ready || (entries.length > 0 && loaded === undefined) ? (
        <FavoritesSkeleton />
      ) : !isLoggedIn ? (
        <>
          {/* Избранное хранится в аккаунте — гостю предлагаем войти */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 p-4 rounded-card bg-gray-50 text-sm">
            <LockOutlinedIcon className="text-gray-400 shrink-0" />
            <p className="flex-1 text-gray-700">{t("guest.text")}</p>
            <Button variant="dark" onClick={openAuthModal} className="self-start sm:self-auto">
              {t("guest.login")}
            </Button>
          </div>
          <FavoritesEmpty />
        </>
      ) : entries.length === 0 ? (
        <FavoritesEmpty />
      ) : (
        <>
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

    </div>
  );
}

/* ---------- Карточки ---------- */

const cardClass = "relative min-w-0 flex gap-3 sm:gap-4 p-3 rounded-card border border-gray-200 bg-white";

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
  const specLine = useSpecLine();
  const placeName = usePlaceName();
  const locale = useLocale();

  const image = listing.images[0];
  const href = `/listing/${listing.id}`;
  const diff = listing.price - entry.price; // < 0 — подешевело с момента добавления
  const added = now === null ? null : Math.round((now - entry.addedAt) / 60_000); // минут назад

  return (
    <article className={`group ${cardClass} hover:border-gray-300 hover:shadow-lg hover:shadow-black/5 transition`}>
      <CarPhoto src={image} alt={listing.title} sizes="176px" className="w-32 sm:w-44 shrink-0 rounded-xl" />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {/* ссылка растянута на всю карточку через after: */}
            <Link href={href} className="after:absolute after:inset-0 after:rounded-card">
              <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary transition">
                {listing.title}
              </h3>
            </Link>

            <div className="flex flex-wrap items-baseline gap-x-2 mt-0.5">
              <span className="text-lg font-semibold">{formatPrice(listing.price)}</span>
              {diff < 0 && (
                <span className="text-sm text-gray-400 line-through">{formatPrice(entry.price)}</span>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <CompareButton id={listing.id} variant="soft" className="relative z-10" />
            <RemoveButton onClick={onRemove} />
          </div>
        </div>

        {diff < 0 && (
          <Badge tone="success" icon={<TrendingDownIcon sx={{ fontSize: 15 }} />} className="self-start mt-1">
            {t("priceDropped", { amount: formatNumber(-diff) })}
          </Badge>
        )}

        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
          {specLine(listing)}
        </div>

        <div className="mt-auto pt-2 flex flex-wrap items-end justify-between gap-2">
          <MetaLine
            items={[
              placeName(listing.city),
              added !== null && (added < 1 ? t("addedJustNow") : t("added", { ago: formatAgo(added, locale) })),
            ]}
          />

          <div className="hidden sm:block">
            <ListingPhone listing={listing} />
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
      <CarPhoto src={undefined} alt="" sizes="176px" className="w-32 sm:w-44 shrink-0 rounded-xl" />

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

function FavoritesEmpty() {
  const t = useTranslations("favorites");
  const { isPublic } = useVisibility();
  const suggested = (useLatestListings(6) ?? []).filter(isPublic).slice(0, 4);

  return (
    <div>
      <EmptyState
        variant="hero"
        icon={FavoriteIcon}
        iconClassName="text-primary"
        title={t("empty.title")}
        text={t("empty.text")}
      >

        <Button size="lg" href="/cars" className="mt-6">
          {t("empty.cta")}
        </Button>

        {/* min-w-0: строка подборок листается вбок, а не растягивает страницу */}
        <div className="mt-8 min-w-0 text-left sm:[&>div]:justify-center">
          <CollectionPills />
        </div>
      </EmptyState>

      <h2 className="text-xl font-semibold tracking-tight mt-12 mb-5">{t("empty.suggested")}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8">
        {suggested.map((listing) => (
          <CarCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}

function FavoritesSkeleton() {
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
