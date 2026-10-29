"use client";

import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import { brands } from "@/features/brands/data/brands";
import { useListingStats } from "@/features/cars/hooks";
import { formatNumber } from "@/lib/utils";

import type { QuickSearchState } from "./useQuickSearch";

// Панели выбора под строкой поиска: марка (с поиском и числом объявлений), модель, цена, год

const sortedBrands = [...brands].sort((a, b) => a.name.localeCompare(b.name));
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 24 }, (_, i) => String(currentYear - i));
const pricePresets = [3000, 5000, 10000, 15000, 20000, 30000];

const panelInputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900 transition";

function OptionButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm text-left transition cursor-pointer ${
        selected ? "bg-gray-900 text-white" : "text-gray-800 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

export function BrandPanel({ search }: { search: QuickSearchState }) {
  const t = useTranslations("search");
  const { byBrand } = useListingStats();
  const { filters, brandQuery, setBrandQuery, selectBrand } = search;
  const found = sortedBrands.filter((b) => b.name.toLowerCase().includes(brandQuery.trim().toLowerCase()));

  return (
    <div>
      <input
        autoFocus
        value={brandQuery}
        onChange={(e) => setBrandQuery(e.target.value)}
        placeholder={t("findBrand")}
        className={panelInputClass}
      />

      <div className="mt-2 max-h-80 overflow-y-auto flex flex-col">
        {found.map((b) => {
          const selected = filters.brand === b.slug;
          const count = byBrand[b.slug] ?? 0;
          return (
            <OptionButton key={b.slug} selected={selected} onClick={() => selectBrand(b.slug)}>
              <span>{b.name}</span>
              <span className={`text-xs tabular-nums ${selected ? "text-white/70" : "text-gray-500"}`}>
                {count > 0 && formatNumber(count)}
              </span>
            </OptionButton>
          );
        })}

        {found.length === 0 && <p className="text-sm text-gray-500 text-center py-6">{t("nothingFound")}</p>}
      </div>
    </div>
  );
}

export function ModelPanel({ search, brandName }: { search: QuickSearchState; brandName: string }) {
  const t = useTranslations("search");
  const { filters, models, pick } = search;

  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 mb-2 px-1">{t("modelsOf", { brand: brandName })}</div>

      <div className="grid grid-cols-2 gap-1 max-h-80 overflow-y-auto">
        <OptionButton selected={!filters.model} onClick={() => pick({ model: "" })}>
          {t("any")}
        </OptionButton>
        {models.map((m) => (
          <OptionButton key={m} selected={filters.model === m} onClick={() => pick({ model: m })}>
            {m}
          </OptionButton>
        ))}
      </div>
    </div>
  );
}

export function PricePanel({ search }: { search: QuickSearchState }) {
  const t = useTranslations("search");
  const { filters, set, closePanel } = search;

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <input
          autoFocus
          type="number"
          min={0}
          value={filters.priceFrom}
          onChange={(e) => set({ priceFrom: e.target.value })}
          placeholder={t("fromPlaceholder")}
          className={panelInputClass}
        />
        <input
          type="number"
          min={0}
          value={filters.priceTo}
          onChange={(e) => set({ priceTo: e.target.value })}
          placeholder={t("toPlaceholder")}
          className={panelInputClass}
        />
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {pricePresets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => set({ priceFrom: "", priceTo: String(p) })}
            className={`px-3 py-1.5 rounded-full text-sm border transition cursor-pointer ${
              filters.priceTo === String(p) && !filters.priceFrom
                ? "bg-gray-900 border-gray-900 text-white"
                : "border-gray-200 text-gray-700 hover:border-gray-900"
            }`}
          >
            {t("priceTo", { value: formatNumber(p) })}
          </button>
        ))}
      </div>

      <Button variant="dark" fullWidth onClick={closePanel} className="mt-4">
        {t("done")}
      </Button>
    </div>
  );
}

export function YearPanel({ search }: { search: QuickSearchState }) {
  const t = useTranslations("search");
  const { filters, pick } = search;

  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 mb-2 px-1">{t("yearFromTitle")}</div>

      <div className="grid grid-cols-4 gap-1">
        <OptionButton selected={!filters.yearFrom} onClick={() => pick({ yearFrom: "" })}>
          {t("anyYearOption")}
        </OptionButton>
        {years.map((y) => (
          <OptionButton key={y} selected={filters.yearFrom === y} onClick={() => pick({ yearFrom: y })}>
            {y}
          </OptionButton>
        ))}
      </div>
    </div>
  );
}
