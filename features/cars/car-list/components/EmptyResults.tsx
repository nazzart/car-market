"use client";

import { useTranslations } from "next-intl";
import SearchOffIcon from "@mui/icons-material/SearchOff";

import CarCard from "@/features/latest-cars/components/CarCard";

import { FilterKey, chipLabel } from "../../config/filterOptions";
import { useDealerLookup } from "@/features/dealers/hooks";
import { usePlaceName } from "@/lib/places";

import type { Listing } from "../../types";
import { useVisibility } from "@/features/moderation/visibility";
import { useCarFilters } from "../hooks/useCarFilters";

// Ничего не нашлось: подсказываем, какой один фильтр убрать и сколько тогда будет авто,
// а ниже — свежие объявления, чтобы страница не была тупиком. Числа и объявления считает сервер (/cars/page.tsx)
export default function EmptyResults({
  suggestions,
  fresh,
}: {
  suggestions: { key: string; count: number }[];
  fresh: Listing[];
}) {
  const t = useTranslations("cars.empty");
  const tChips = useTranslations("cars.chips");
  const tCommon = useTranslations("common");
  const tOptions = useTranslations("options");
  const { params, updateFilter, resetFilters } = useCarFilters();
  const dealerOf = useDealerLookup();
  const placeName = usePlaceName();
  // как в поиске: скрытые, проданные и ожидающие проверки не предлагаем
  const { isPublic } = useVisibility();

  const names = { dealer: (slug: string) => dealerOf(slug)?.name, place: placeName };
  const relax = suggestions
    .filter((s) => params.get(s.key))
    .map((s) => ({
      ...s,
      label: chipLabel(s.key as FilterKey, params.get(s.key)!, tOptions, tChips, names, params.get("area")),
    }));
  const freshPublic = fresh.filter(isPublic);

  return (
    <div>
      <div className="text-center py-12 px-6 rounded-2xl border border-dashed border-gray-200">
        <SearchOffIcon sx={{ fontSize: 48 }} className="text-gray-300" />

        <h3 className="text-lg font-semibold mt-3">{t("title")}</h3>
        <p className="text-gray-500 mt-1">{relax.length > 0 ? t("relax") : t("text")}</p>

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

        <button
          type="button"
          onClick={resetFilters}
          className="mt-5 px-5 py-2.5 rounded-full bg-gray-900 hover:bg-black text-white text-sm font-medium transition cursor-pointer"
        >
          {tCommon("resetFilters")}
        </button>
      </div>

      <h3 className="text-lg font-semibold tracking-tight mt-10 mb-5">{t("fresh")}</h3>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8">
        {freshPublic.map((listing) => (
          <CarCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
