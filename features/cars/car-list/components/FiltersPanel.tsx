"use client";

import { useTranslations } from "next-intl";

import { brands } from "@/features/brands/data/brands";
import { modelsByBrand } from "@/features/brands/data/models";

import { useCarFilters } from "../hooks/useCarFilters";
import {
  bodyTypes,
  conditions,
  drives,
  fuels,
  sellerTypes,
  transmissions,
} from "../../config/filterOptions";
import { ChipGroup, FilterSection, Segmented, Select, inputClass } from "./ui";

const brandOptions = [...brands]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((b) => ({ label: b.name, value: b.slug }));

// Поле «от–до». Неуправляемые input + key: значение применяется по blur/Enter,
// а при сбросе фильтров поле пересоздаётся с новым значением из URL
function RangeInputs({
  fromKey,
  toKey,
  unit,
}: {
  fromKey?: string;
  toKey: string;
  unit: string;
}) {
  const t = useTranslations("cars.panel");
  const { params, updateFilter } = useCarFilters();

  const commit = (key: string) => (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value !== (params.get(key) ?? "")) updateFilter(key, value || null);
  };

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  const field = (key: string, placeholder: string) => (
    <input
      key={`${key}-${params.get(key) ?? ""}`}
      type="number"
      min={0}
      inputMode="numeric"
      defaultValue={params.get(key) ?? ""}
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
  const { params, updateFilter } = useCarFilters();

  // value → { label, value } из переводов options.{group}
  const opts = (group: string, values: string[]) =>
    values.map((value) => ({ value, label: tOptions(`${group}.${value}`) }));

  const get = (key: string) => params.get(key) ?? "";
  const set = (key: string) => (value: string | null) =>
    updateFilter(key, value || null);

  const brand = get("brand");
  const models = (modelsByBrand[brand] ?? []).map((m) => ({
    label: m,
    value: m,
  }));

  return (
    <div>
      <FilterSection title={t("condition")}>
        <Segmented
          anyLabel={t("all")}
          options={opts("condition", conditions)}
          value={get("condition")}
          onChange={set("condition")}
        />
      </FilterSection>

      <FilterSection title={t("brandModel")}>
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

      <FilterSection title={t("price")}>
        <RangeInputs fromKey="priceFrom" toKey="priceTo" unit={t("unitEur")} />
      </FilterSection>

      <FilterSection title={t("year")}>
        <RangeInputs fromKey="yearFrom" toKey="yearTo" unit={t("unitYear")} />
      </FilterSection>

      <FilterSection title={t("mileage")}>
        <RangeInputs toKey="mileageTo" unit={t("unitKm")} />
      </FilterSection>

      <FilterSection title={t("body")}>
        <ChipGroup
          options={opts("bodyType", bodyTypes)}
          value={get("bodyType")}
          onChange={set("bodyType")}
        />
      </FilterSection>

      <FilterSection title={t("engine")}>
        <ChipGroup
          options={opts("fuel", fuels)}
          value={get("fuel")}
          onChange={set("fuel")}
        />
      </FilterSection>

      <FilterSection title={t("gearbox")}>
        <Segmented
          anyLabel={t("any")}
          options={opts("transmission", transmissions)}
          value={get("transmission")}
          onChange={set("transmission")}
        />
      </FilterSection>

      <FilterSection title={t("drive")}>
        <ChipGroup
          options={opts("drive", drives)}
          value={get("drive")}
          onChange={set("drive")}
        />
      </FilterSection>

      <FilterSection title={t("seller")}>
        <Segmented
          anyLabel={t("all")}
          options={opts("sellerType", sellerTypes)}
          value={get("sellerType")}
          onChange={set("sellerType")}
        />
      </FilterSection>
    </div>
  );
}
