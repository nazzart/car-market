"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import { matchesQuery } from "@/components/ui/SearchSelect";
import type { SelectOption } from "@/components/ui/types";
import { useBrands } from "@/features/catalog/hooks";
import { useListingStats } from "@/features/cars/hooks";
import { modelValue, parseModelValue } from "@/features/cars/lib/modelOptions";
import { formatNumber } from "@/lib/utils";

import type { QuickSearchState } from "./useQuickSearch";

// Панели выбора под строкой поиска: марка (с поиском и числом объявлений), модель, цена, год

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 24 }, (_, i) => String(currentYear - i));
const pricePresets = [3000, 5000, 10000, 15000, 20000, 30000];

const panelInputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900 transition";

type OptionButtonProps = { selected: boolean; onClick: () => void; children: React.ReactNode };

function OptionButton({ selected, onClick, children }: OptionButtonProps) {
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

type BrandPanelProps = { search: QuickSearchState };

export function BrandPanel({ search }: BrandPanelProps) {
  const t = useTranslations("search");
  const { byBrand } = useListingStats();
  const sortedBrands = useBrands();
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

type ModelPanelProps = { search: QuickSearchState; brandName: string };

// Модели и под каждой — версии чипами («530», «540»). Поиск находит и точные версии каталога: «530d» → 5 Series · 530d
export function ModelPanel({ search, brandName }: ModelPanelProps) {
  const t = useTranslations("search");
  const { filters, models, pick } = search;
  const [query, setQuery] = useState("");

  const selected = modelValue(filters.model, filters.version);
  const choose = (value: string) => pick(parseModelValue(value));

  const searching = query.trim() !== "";
  const found = searching ? models.filter((o) => matchesQuery(o, query)) : [];

  // модель → её версии, без точных версий (кроме выбранной)
  const groups: { model: SelectOption; versions: SelectOption[] }[] = [];
  for (const option of models) {
    if (!option.indent) groups.push({ model: option, versions: [] });
    else if (!option.searchOnly || option.value === selected) groups.at(-1)?.versions.push(option);
  }

  // пример версии этой марки — подсказка, что искать можно и по ней: точная версия самой частой группы («120» → «120d»)
  const top = models.filter((o) => o.indent && o.count).sort((a, b) => b.count! - a.count!)[0];
  const example = (top && models.find((o) => o.searchOnly && o.value.startsWith(top.value)))?.label ?? top?.label;

  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 mb-2 px-1">{t("modelsOf", { brand: brandName })}</div>
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && found[0]) {
            e.preventDefault();
            choose(found[0].value);
          }
        }}
        placeholder={example ? t("findModelExample", { example }) : t("findModel")}
        aria-label={t("findModel")}
        className={panelInputClass}
      />

      <div className="mt-2 max-h-80 overflow-y-auto flex flex-col">
        {searching ? (
          found.map((o) => (
            <OptionButton key={o.value} selected={o.value === selected} onClick={() => choose(o.value)}>
              <span>{o.fullLabel ?? o.label}</span>
              <Count value={o.count} selected={o.value === selected} />
            </OptionButton>
          ))
        ) : (
          <>
            <OptionButton selected={!filters.model} onClick={() => choose("")}>
              {t("anyModel")}
            </OptionButton>

            {groups.map(({ model, versions }) => (
              <div key={model.value}>
                <OptionButton selected={model.value === selected} onClick={() => choose(model.value)}>
                  <span>{model.label}</span>
                  <Count value={model.count} selected={model.value === selected} />
                </OptionButton>

                {versions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pl-3 pr-1 pt-1 pb-2">
                    {versions.map((v) => {
                      const on = v.value === selected;
                      return (
                        <button
                          key={v.value}
                          type="button"
                          onClick={() => choose(v.value)}
                          aria-pressed={on}
                          aria-label={v.fullLabel}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium transition cursor-pointer ${
                            on ? "bg-gray-900 border-gray-900 text-white" : "border-gray-200 text-gray-700 hover:border-gray-900"
                          }`}
                        >
                          {v.label}
                          {v.count ? <span className={`tabular-nums ${on ? "text-white/70" : "text-gray-400"}`}>{v.count}</span> : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {searching && found.length === 0 && <p className="text-sm text-gray-500 text-center py-6">{t("nothingFound")}</p>}
      </div>
    </div>
  );
}

type CountProps = { value?: number; selected: boolean };

function Count({ value, selected }: CountProps) {
  return (
    <span className={`text-xs tabular-nums ${selected ? "text-white/70" : "text-gray-500"}`}>
      {value ? formatNumber(value) : null}
    </span>
  );
}

type PricePanelProps = { search: QuickSearchState };

export function PricePanel({ search }: PricePanelProps) {
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

type YearPanelProps = { search: QuickSearchState };

export function YearPanel({ search }: YearPanelProps) {
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
