"use client";

import { useState } from "react";
import TuneIcon from "@mui/icons-material/Tune";
import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { brands } from "@/features/brands/data/brands";
import { collections } from "@/features/collections/data/collections";
import CollectionPills from "@/features/collections/components/CollectionPills";
import CarCard from "@/features/latest-cars/components/CarCard";
import { formatNumber, plural } from "@/lib/utils";

import { useCarFilters } from "../hooks/useCarFilters";
import { listings } from "../../data/listings";
import { filterListings } from "../../lib/filterListings";
import { sortOptions } from "../../config/filterOptions";
import ActiveFilterChips from "./ActiveFilterChips";
import EmptyResults from "./EmptyResults";
import FiltersPanel from "./FiltersPanel";
import ListingRow from "./ListingRow";
import MobileFiltersDrawer from "./MobileFiltersDrawer";
import { inputClass } from "./ui";

const views = [
  { value: "list", label: "Списком", icon: ViewAgendaOutlinedIcon },
  { value: "grid", label: "Плиткой", icon: GridViewOutlinedIcon },
];

export default function CarsSearchView() {
  const { params, updateFilter, resetFilters, activeCount } = useCarFilters();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const results = filterListings(listings, params);
  const view = params.get("view") === "grid" ? "grid" : "list";

  const resultsLabel = `${formatNumber(results.length)} ${plural(results.length, [
    "объявление",
    "объявления",
    "объявлений",
  ])}`;

  // Заголовок отражает поиск: «BMW M4», «Электромобили» или общий
  const brandName = brands.find((b) => b.slug === params.get("brand"))?.name;
  const collection = collections.find((c) => c.slug === params.get("collection"));

  const title = brandName
    ? [brandName, params.get("model")].filter(Boolean).join(" ")
    : collection?.label ?? "Купить автомобиль";

  return (
    <div className="pt-6 pb-12">
      {/* Header */}

      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-gray-500 mt-1">{resultsLabel} в Латвии</p>
      </div>

      <div className="mb-8">
        <CollectionPills />
      </div>

      <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
        {/* Sidebar (desktop) */}

        <aside className="hidden lg:block sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Фильтры</h2>

            {activeCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm text-gray-600 hover:text-black hover:underline underline-offset-4 cursor-pointer"
              >
                Сбросить
              </button>
            )}
          </div>

          <FiltersPanel />
        </aside>

        {/* Results */}

        <div className="min-w-0">
          {/* Toolbar */}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium hover:border-gray-900 transition cursor-pointer"
            >
              <TuneIcon fontSize="small" />
              Фильтры
              {activeCount > 0 && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>

            <div className="hidden lg:block text-sm text-gray-500">
              Найдено: <span className="font-medium text-gray-900">{resultsLabel}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  aria-label="Сортировка"
                  value={params.get("sort") ?? ""}
                  onChange={(e) => updateFilter("sort", e.target.value || null)}
                  className={`${inputClass} appearance-none pr-9 cursor-pointer w-auto max-w-[200px] sm:max-w-none`}
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <KeyboardArrowDownIcon
                  fontSize="small"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>

              <div className="hidden sm:flex p-1 rounded-xl bg-gray-100">
                {views.map((v) => {
                  const Icon = v.icon;
                  const active = view === v.value;

                  return (
                    <button
                      key={v.value}
                      type="button"
                      aria-label={v.label}
                      aria-pressed={active}
                      onClick={() => updateFilter("view", v.value === "list" ? null : v.value)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg transition cursor-pointer ${
                        active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-black"
                      }`}
                    >
                      <Icon fontSize="small" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active filters */}

          <div className="mt-4 empty:hidden">
            <ActiveFilterChips />
          </div>

          {/* List */}

          <div className="mt-5">
            {results.length === 0 ? (
              <EmptyResults />
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8">
                {results.map((listing) => (
                  <CarCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((listing) => (
                  <ListingRow key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileFiltersDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        resultsLabel={resultsLabel}
      />
    </div>
  );
}
