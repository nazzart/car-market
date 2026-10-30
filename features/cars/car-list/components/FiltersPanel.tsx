"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { useBrands } from "@/features/catalog/hooks";
import type { Brand } from "@/features/catalog/types";
import { useListingStats } from "@/features/cars/hooks";
import SearchSelect from "@/components/ui/SearchSelect";
import { formatNumber } from "@/lib/utils";
import { modelOptions, modelValue, parseModelValue } from "@/features/cars/lib/modelOptions";
import type { FilterModel } from "@/features/cars/types";
import CheckIcon from "@mui/icons-material/Check";
import { carColors } from "../../config/colors";

import { useCarFilters } from "../hooks/useCarFilters";
import {
  bodyTypes,
  conditions,
  drives,
  advancedKeys,
  flagFilters,
  latviaOptions,
  postedPeriods,
  fuels,
  sellerTypes,
  transmissions,
} from "../../config/filterOptions";
import { ChipGroup, Segmented, inputClass } from "@/components/ui/form";

import { FilterSection } from "./FilterSection";
import LocationFilter from "./LocationFilter";


type RangeInputsProps = {
  fromKey?: string;
  toKey: string;
  unit: string;
  grouped?: boolean;
};

// Поле «от–до». Неуправляемые input + key: значение применяется по blur/Enter,
// а при сбросе фильтров поле пересоздаётся с новым значением из URL
// grouped — цену и пробег показываем с разрядами: «40 000», год — как есть
function RangeInputs({
  fromKey,
  toKey,
  unit,
  grouped = true,
}: RangeInputsProps) {
  const t = useTranslations("cars.panel");
  const { params, updateFilter } = useCarFilters();

  const commit = (key: string) => (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value !== (params.get(key) ?? "")) updateFilter(key, value || null);
  };

  const display = (value: string | null) => (value ? (grouped ? formatNumber(Number(value)) : value) : "");

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  const field = (key: string, placeholder: string) => (
    <input
      key={`${key}-${params.get(key) ?? ""}`}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      defaultValue={display(params.get(key))}
      placeholder={placeholder}
      aria-label={placeholder}
      onBlur={commit(key)}
      onKeyDown={onEnter}
      className={inputClass}
    />
  );

  if (!fromKey) return field(toKey, t("to", { unit }));

  return (
    <div className="grid grid-cols-2 gap-2">
      {field(fromKey, t("from", { unit }))}
      {field(toKey, t("to", { unit }))}
    </div>
  );
}

type FlagChipProps = { name: string };

// Флажок-чип «да/нет» (в URL — "1")
function FlagChip({ name }: FlagChipProps) {
  const tChips = useTranslations("cars.chips");
  const { params, updateFilter } = useCarFilters();
  const on = params.get(name) === "1";

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => updateFilter(name, on ? null : "1")}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition cursor-pointer ${
        on ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-200 text-gray-700 hover:border-gray-900"
      }`}
    >
      {on && <CheckIcon sx={{ fontSize: 15 }} />}
      {tChips(name)}
    </button>
  );
}

type FiltersPanelProps = {
  models?: FilterModel[]; // модели выбранной марки из каталога, с версиями из объявлений (сервер)
};

export default function FiltersPanel({ models: brandModels = [] }: FiltersPanelProps) {
  const t = useTranslations("cars.panel");
  const tOptions = useTranslations("options");
  const tChips = useTranslations("cars.chips");
  const { params, updateFilter, updateFilters } = useCarFilters();

  // value → { label, value } из переводов options.{group}
  const opts = (group: string, values: string[]) =>
    values.map((value) => ({ value, label: tOptions(`${group}.${value}`) }));

  const get = (key: string) => params.get(key) ?? "";
  const set = (key: string) => (value: string | null) =>
    updateFilter(key, value || null);

  const isActive = (keys: string[]) => keys.some((key) => params.get(key));

  const advancedActive = advancedKeys.filter((key) => params.get(key)).length;
  const [showAdvanced, setShowAdvanced] = useState(false);
  const advancedOpen = showAdvanced || advancedActive > 0;

  // сколько объявлений у каждой марки и модели — подсказка рядом с названием (считает сервер)
  const { byBrand, byModel } = useListingStats();
  const brand = get("brand");

  const brands = useBrands();
  const brandOption = (b: Brand) => ({ value: b.slug, label: b.name, count: byBrand[b.slug] });

  // Модели и под каждой — её версии из объявлений, которые есть сейчас: «5 Series» → «530», «540».
  // Выбор версии — сразу модель и версия (?model=5 Series&version=530)
  // Точные версии («530d») находятся вводом в поле
  const selectedModel = modelValue(get("model"), get("version"));
  const models = modelOptions(brandModels, (model) => byModel[brand]?.[model], selectedModel);
  const pickModel = (value: string) => {
    const { model, version } = parseModelValue(value);
    updateFilters({ model: model || null, version: version || null });
  };

  return (
    <div>
      <FilterSection title={t("condition")} active={isActive(["condition"])}>
        <Segmented
          anyLabel={t("all")}
          options={opts("condition", conditions)}
          value={get("condition")}
          onChange={set("condition")}
        />
      </FilterSection>

      <FilterSection title={t("brandModel")} active={isActive(["brand", "model", "version"])}>
        <div className="space-y-2">
          <SearchSelect
            variant="compact"
            label={t("brand")}
            placeholder={t("anyBrand")}
            featured={brands.filter((b) => b.popular).map(brandOption)}
            featuredLabel={t("popularBrands")}
            options={brands.map(brandOption)}
            allLabel={t("allBrands")}
            value={brand}
            onChange={set("brand")}
          />

          <SearchSelect
            variant="compact"
            label={t("model")}
            placeholder={brand ? t("anyModel") : t("brandFirst")}
            options={models}
            value={selectedModel}
            onChange={pickModel}
            disabled={!brand || models.length === 0}
          />
        </div>

      </FilterSection>

      <FilterSection title={t("price")} active={isActive(["priceFrom", "priceTo"])}>
        <RangeInputs fromKey="priceFrom" toKey="priceTo" unit={t("unitEur")} />
      </FilterSection>

      <FilterSection title={t("year")} active={isActive(["yearFrom", "yearTo"])}>
        <RangeInputs fromKey="yearFrom" toKey="yearTo" unit={t("unitYear")} grouped={false} />
      </FilterSection>

      <FilterSection title={t("mileage")} active={isActive(["mileageTo"])}>
        <RangeInputs toKey="mileageTo" unit={t("unitKm")} />
      </FilterSection>

      <FilterSection title={t("body")} active={isActive(["bodyType"])}>
        <ChipGroup
          options={opts("bodyType", bodyTypes)}
          value={get("bodyType")}
          onChange={set("bodyType")}
        />
      </FilterSection>

      <FilterSection title={t("engine")} active={isActive(["fuel"])}>
        <ChipGroup
          options={opts("fuel", fuels)}
          value={get("fuel")}
          onChange={set("fuel")}
        />
      </FilterSection>

      <FilterSection title={t("gearbox")} active={isActive(["transmission"])}>
        <Segmented
          anyLabel={t("any")}
          options={opts("transmission", transmissions)}
          value={get("transmission")}
          onChange={set("transmission")}
        />
      </FilterSection>

      <FilterSection title={t("location")} active={isActive(["place"])}>
        <LocationFilter />
      </FilterSection>

      {/* Доверие: несколько флажков можно включить сразу */}
      <FilterSection title={t("history")} active={isActive([...flagFilters, "latvia"])}>
        <div className="flex flex-wrap gap-1.5">
          {flagFilters.map((key) => (
            <FlagChip key={key} name={key} />
          ))}
        </div>

        <div className="text-xs text-gray-500 mt-4 mb-1.5">{t("mileageLatvia")}</div>
        {/* чипы, а не переключатель: подписи длинные и должны переноситься */}
        <ChipGroup
          options={latviaOptions.map((value) => ({ value, label: tChips(`latvia.${value}`) }))}
          value={get("latvia")}
          onChange={set("latvia")}
        />
      </FilterSection>

      {/* Реже используемые — свёрнуты; раскрываются сами, если какой-то из них выбран */}
      <div className="py-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!advancedOpen)}
          aria-expanded={advancedOpen}
          className="w-full flex items-center justify-between gap-2 h-11 px-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 text-sm font-semibold text-gray-900 transition cursor-pointer"
        >
          <span className="flex items-center gap-2">
            {t("advanced")}
            {advancedActive > 0 && (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {advancedActive}
              </span>
            )}
          </span>
          <KeyboardArrowDownIcon fontSize="small" className={`transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {advancedOpen && (
        <div className="border-t border-gray-900/10">
          <FilterSection title={t("power")} active={isActive(["powerFrom", "powerTo"])}>
            <RangeInputs fromKey="powerFrom" toKey="powerTo" unit={t("unitHp")} grouped={false} />
          </FilterSection>

          <FilterSection title={t("drive")} active={isActive(["drive"])}>
            <ChipGroup
              options={opts("drive", drives)}
              value={get("drive")}
              onChange={set("drive")}
            />
          </FilterSection>

          <FilterSection title={t("color")} active={isActive(["color"])}>
            <div className="flex flex-wrap gap-2">
              {carColors.map((c) => {
                const on = get("color") === c.value;
                const label = tOptions(`colors.${c.value}`);
                return (
                  <button
                    key={c.value}
                    type="button"
                    aria-pressed={on}
                    aria-label={label}
                    title={label}
                    onClick={() => set("color")(on ? null : c.value)}
                    className={`w-8 h-8 rounded-full border transition cursor-pointer ${
                      on ? "ring-2 ring-offset-2 ring-gray-900 border-transparent" : "border-gray-300 hover:scale-110"
                    }`}
                    style={{ background: c.color }}
                  />
                );
              })}
            </div>
          </FilterSection>

          <FilterSection title={t("seller")} active={isActive(["sellerType"])}>
            <Segmented
              anyLabel={t("all")}
              options={opts("sellerType", sellerTypes)}
              value={get("sellerType")}
              onChange={set("sellerType")}
            />
          </FilterSection>

          <FilterSection title={t("posted")} active={isActive(["posted", "withPhotos"])}>
            <Segmented
              anyLabel={t("anyTime")}
              options={Object.keys(postedPeriods).map((value) => ({ value, label: tChips(`postedShort.${value}`) }))}
              value={get("posted")}
              onChange={set("posted")}
            />
            <div className="mt-3">
              <FlagChip name="withPhotos" />
            </div>
          </FilterSection>
        </div>
      )}
    </div>
  );
}
