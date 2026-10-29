"use client";

import { useTranslations } from "next-intl";

import { useCarFilters } from "@/features/cars/car-list/hooks/useCarFilters";

import { collections } from "../config";

const pillClass = (active: boolean) => `
  shrink-0
  inline-flex items-center gap-1.5
  px-4 py-2
  rounded-full
  border
  text-sm font-medium
  transition
  cursor-pointer
  ${
    active
      ? "bg-gray-900 border-gray-900 text-white"
      : "bg-white border-gray-200 text-gray-700 hover:border-gray-900 hover:text-black"
  }
`;

// Переключатель подборок на странице поиска — остальные фильтры сохраняются
export default function CollectionPills() {
  const t = useTranslations("cars");
  const tOptions = useTranslations("options");
  const { params, updateFilter } = useCarFilters();

  const activeSlug = params.get("collection") ?? "";
  const active = collections.find((c) => c.slug === activeSlug);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        <button
          type="button"
          onClick={() => updateFilter("collection", null)}
          aria-pressed={!active}
          className={pillClass(!active)}
        >
          {t("allCars")}
        </button>

        {collections.map((c) => {
          const Icon = c.icon;
          const isActive = c.slug === activeSlug;

          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => updateFilter("collection", c.slug)}
              aria-pressed={isActive}
              className={pillClass(isActive)}
            >
              <Icon sx={{ fontSize: 18 }} />
              {tOptions(`collections.${c.slug}.label`)}
            </button>
          );
        })}
      </div>

      {active && (
        <p className="text-sm text-gray-500 mt-3">
          {tOptions(`collections.${active.slug}.description`)}
        </p>
      )}
    </div>
  );
}
