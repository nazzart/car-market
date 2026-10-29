"use client";

import { useState, useSyncExternalStore } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import { inputClass } from "@/components/ui/form";
import PageHeader from "@/components/ui/PageHeader";
import { useToast } from "@/components/ui/Toast";
import { openAuthModal, useAuth } from "@/features/auth/store";
import { useListingsByIds } from "@/features/cars/hooks";
import { useNow } from "@/lib/useNow";

import { addFavorite, clearFavorites, removeFavorite, useFavorites } from "../store";
import { FAVORITE_SORTS, type FavoriteEntry, type FavoriteSort } from "../types";
import FavoriteCard from "./FavoriteCard";
import FavoritesEmpty from "./FavoritesEmpty";
import FavoritesSkeleton from "./FavoritesSkeleton";
import UnavailableCard from "./UnavailableCard";

// true только в браузере после гидратации — до этого избранное ещё не прочитано
const noop = () => () => {};
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

// /favorites: сохранённые объявления с сортировкой, «подешевело» и отменой удаления
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

  const [sort, setSort] = useState<FavoriteSort>("added");
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
                    onChange={(e) => setSort(e.target.value as FavoriteSort)}
                    className={`${inputClass} appearance-none pr-9 cursor-pointer w-auto`}
                  >
                    {FAVORITE_SORTS.map((value) => (
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
