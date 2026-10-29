"use client";

// /compare: до MAX_COMPARE машин бок о бок. Список — в браузере (../store), данные машин — с сервера
import { useState, useSyncExternalStore } from "react";
import { Switch } from "@mui/material";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import { useListingsByIds } from "@/features/cars/hooks";
import { useFavorites } from "@/features/favorites/store";

import { MAX_COMPARE, addToCompare, clearCompare, useCompare } from "../store";
import CompareEmpty from "./CompareEmpty";
import CompareTable from "./CompareTable";
import type { CompareRow } from "../types";
import { useCompareSections } from "./rows";

// true только в браузере после гидратации — до этого список сравнения ещё не прочитан
const noop = () => () => {};
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

export default function CompareView() {
  const t = useTranslations("compare");
  const hydrated = useHydrated();
  const ids = useCompare();
  const { entries: favorites } = useFavorites();
  const [onlyDiff, setOnlyDiff] = useState(false);

  // одним запросом — машины в сравнении и избранное (чтобы предложить добавить его)
  const loaded = useListingsByIds([...new Set([...ids, ...favorites.map((f) => f.id)])]);
  const listingOf = (id: string) => loaded?.find((l) => l.id === id);
  const cars = ids.map(listingOf).filter((l) => l !== undefined);
  const sections = useCompareSections(cars);

  if (!hydrated || loaded === undefined) return <Skeleton className="h-96 my-6 rounded-panel bg-gray-50" />;

  const favoritesToAdd = favorites.filter((f) => !ids.includes(f.id) && listingOf(f.id) !== undefined);

  const addFromFavorites = () => {
    for (const f of favoritesToAdd) if (!addToCompare(f.id)) break;
  };

  if (cars.length === 0) return <CompareEmpty favoritesCount={favoritesToAdd.length} onAddFavorites={addFromFavorites} />;

  const differs = (row: CompareRow) => new Set(cars.map((l) => String(row.value(l)))).size > 1;
  const visibleSections = sections
    .map((s) => ({ ...s, rows: onlyDiff && cars.length > 1 ? s.rows.filter(differs) : s.rows }))
    .filter((s) => s.rows.length > 0);

  return (
    <div className="pt-6 pb-16">
      {/* Header */}

      <PageHeader
        title={t("title")}
        subtitle={t("subtitle", { count: cars.length, max: MAX_COMPARE })}
        actions={
          <>
              {cars.length > 1 && (
                <label className="inline-flex items-center gap-1 pr-3 rounded-xl text-sm font-medium cursor-pointer select-none">
                  <Switch checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} />
                  {t("onlyDiff")}
                </label>
              )}

              <Button variant="ghost" onClick={clearCompare}>
                {t("clear")}
              </Button>
        
          </>
        }
      />

      <CompareTable
        cars={cars}
        sections={visibleSections}
        onlyDiff={onlyDiff}
        favoritesCount={favoritesToAdd.length}
        onAddFavorites={addFromFavorites}
      />
    </div>
  );
}
