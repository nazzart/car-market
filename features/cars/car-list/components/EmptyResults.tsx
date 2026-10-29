"use client";

import { useTranslations } from "next-intl";
import SearchOffIcon from "@mui/icons-material/SearchOff";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import CarCard from "@/features/latest-cars/components/CarCard";

import { FilterKey, chipLabel } from "../../config/filterOptions";
import { usePlaceName } from "@/lib/places";

import type { Listing } from "../../types";
import { useCarFilters } from "../hooks/useCarFilters";

type EmptyResultsProps = {
  suggestions: { key: string; count: number }[];
  fresh: Listing[];
  dealerName?: string; // фильтр ?dealer= — название для подсказки «без дилера»
};

// Ничего не нашлось: подсказываем, какой один фильтр убрать и сколько тогда будет авто,
// а ниже — свежие объявления, чтобы страница не была тупиком. Числа и объявления считает сервер (/cars/page.tsx)
export default function EmptyResults({ suggestions, fresh, dealerName }: EmptyResultsProps) {
  const t = useTranslations("cars.empty");
  const tChips = useTranslations("cars.chips");
  const tCommon = useTranslations("common");
  const tOptions = useTranslations("options");
  const { params, updateFilter, resetFilters } = useCarFilters();
  const placeName = usePlaceName();

  const names = { dealer: () => dealerName, place: placeName };
  const relax = suggestions
    .filter((s) => params.get(s.key))
    .map((s) => ({
      ...s,
      label: chipLabel(s.key as FilterKey, params.get(s.key)!, tOptions, tChips, names, params.get("area")),
    }));

  return (
    <div>
      <EmptyState icon={SearchOffIcon} title={t("title")} text={relax.length > 0 ? t("relax") : t("text")}>

        {relax.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {relax.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => updateFilter(s.key, null)}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-gray-200 bg-white text-sm hover:border-gray-900 transition cursor-pointer"
              >
                <span className="font-medium text-gray-900">{t("without", { label: s.label })}</span>
                <span className="text-gray-500">{tCommon("listings", { count: s.count })}</span>
              </button>
            ))}
          </div>
        )}

        <Button variant="dark" onClick={resetFilters} className="mt-5">
          {tCommon("resetFilters")}
        </Button>
      </EmptyState>

      <h3 className="text-lg font-semibold tracking-tight mt-10 mb-5">{t("fresh")}</h3>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8">
        {fresh.map((listing) => (
          <CarCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
