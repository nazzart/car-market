"use client";

import { useTranslations } from "next-intl";

import { brands } from "@/features/brands/data/brands";
import { modelsByBrand } from "@/features/brands/data/models";
import { formatNumber } from "@/lib/utils";
import CheckIcon from "@mui/icons-material/Check";
import { carColors } from "../../config/colors";

import { useCarFilters } from "../hooks/useCarFilters";
import {
  bodyTypes,
  conditions,
  drives,
  flagFilters,
  postedPeriods,
  fuels,
  sellerTypes,
  transmissions,
} from "../../config/filterOptions";
import { ChipGroup, FilterSection, Segmented, Select, inputClass } from "./ui";
import LocationFilter from "./LocationFilter";

const brandOptions = [...brands]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((b) => ({ label: b.name, value: b.slug }));

// Поле «от–до». Неуправляемые input + key: значение применяется по blur/Enter,
// а при сбросе фильтров поле пересоздаётся с новым значением из URL
// grouped — цену и пробег показываем с разрядами: «40 000», год — как есть
function RangeInputs({
  fromKey,
  toKey,
  unit,
  grouped = true,
}: {
  fromKey?: string;
  toKey: string;
  unit: string;
  grouped?: boolean;
}) {
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

export default function FiltersPanel() {
  const t = useTranslations("cars.panel");
  const tOptions = useTranslations("options");
  const tChips = useTranslations("cars.chips");
  const { params, updateFilter } = useCarFilters();

  // value → { label, value } из переводов options.{group}
  const opts = (group: string, values: string[]) =>
    values.map((value) => ({ value, label: tOptions(`${group}.${value}`) }));

  const get = (key: string) => params.get(key) ?? "";
  const set = (key: string) => (value: string | null) =>
    updateFilter(key, value || null);

  const isActive = (keys: string[]) => keys.some((key) => params.get(key));

  const brand = get("brand");
  const models = (modelsByBrand[brand] ?? []).map((m) => ({
    label: m,
    value: m,
  }));

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

      <FilterSection title={t("brandModel")} active={isActive(["brand", "model"])}>
        <div className="space-y-2">
          <Select
            label={t("brand")}
            placeholder={t("anyBrand")}
            options={brandOptions}
            value={brand}
            onChange={set("brand")}
          />

          <Select
            label={t("model")}
            placeholder={brand ? t("anyModel") : t("brandFirst")}
            options={models}
            value={get("model")}
            onChange={set("model")}
            disabled={!brand || models.length === 0}
          />
        </div>
      </FilterSection>

      <FilterSection title={t("location")} active={isActive(["radius"])}>
        <LocationFilter />
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

      {/* Флажки доверия — несколько можно включить сразу */}
      <FilterSection title={t("history")} active={isActive([...flagFilters])}>
        <div className="flex flex-wrap gap-1.5">
          {flagFilters.map((key) => {
            const on = get(key) === "1";
            return (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                onClick={() => set(key)(on ? null : "1")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition cursor-pointer ${
                  on ? "bg-gray-900 border-gray-900 text-white" : "border-gray-200 text-gray-700 hover:border-gray-900"
                }`}
              >
                {on && <CheckIcon sx={{ fontSize: 15 }} />}
                {tChips(key)}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title={t("body")} active={isActive(["bodyType"])}>
        <ChipGroup
          options={opts("bodyType", bodyTypes)}
          value={get("bodyType")}
          onChange={set("bodyType")}
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

      <FilterSection title={t("drive")} active={isActive(["drive"])}>
        <ChipGroup
          options={opts("drive", drives)}
          value={get("drive")}
          onChange={set("drive")}
        />
      </FilterSection>

      <FilterSection title={t("seller")} active={isActive(["sellerType"])}>
        <Segmented
          anyLabel={t("all")}
          options={opts("sellerType", sellerTypes)}
          value={get("sellerType")}
          onChange={set("sellerType")}
        />
      </FilterSection>

      <FilterSection title={t("posted")} active={isActive(["posted"])}>
        <Segmented
          anyLabel={t("anyTime")}
          options={Object.keys(postedPeriods).map((value) => ({ value, label: tChips(`postedShort.${value}`) }))}
          value={get("posted")}
          onChange={set("posted")}
        />
      </FilterSection>
    </div>
  );
}
