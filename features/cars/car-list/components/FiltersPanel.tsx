"use client";

import { brands } from "@/features/brands/data/brands";
import { modelsByBrand } from "@/features/brands/data/models";

import { useCarFilters } from "../hooks/useCarFilters";
import {
  bodyTypeOptions,
  conditionOptions,
  driveOptions,
  fuelOptions,
  sellerOptions,
  transmissionOptions,
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

  if (!fromKey) return field(toKey, `До, ${unit}`);

  return (
    <div className="grid grid-cols-2 gap-2">
      {field(fromKey, `От, ${unit}`)}
      {field(toKey, `До, ${unit}`)}
    </div>
  );
}

export default function FiltersPanel() {
  const { params, updateFilter } = useCarFilters();

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
      <FilterSection title="Состояние">
        <Segmented
          anyLabel="Все"
          options={conditionOptions}
          value={get("condition")}
          onChange={set("condition")}
        />
      </FilterSection>

      <FilterSection title="Марка и модель">
        <div className="space-y-2">
          <Select
            label="Марка"
            placeholder="Любая марка"
            options={brandOptions}
            value={brand}
            onChange={set("brand")}
          />

          <Select
            label="Модель"
            placeholder={brand ? "Любая модель" : "Сначала выберите марку"}
            options={models}
            value={get("model")}
            onChange={set("model")}
            disabled={!brand || models.length === 0}
          />
        </div>
      </FilterSection>

      <FilterSection title="Цена">
        <RangeInputs fromKey="priceFrom" toKey="priceTo" unit="€" />
      </FilterSection>

      <FilterSection title="Год выпуска">
        <RangeInputs fromKey="yearFrom" toKey="yearTo" unit="год" />
      </FilterSection>

      <FilterSection title="Пробег">
        <RangeInputs toKey="mileageTo" unit="км" />
      </FilterSection>

      <FilterSection title="Кузов">
        <ChipGroup
          options={bodyTypeOptions}
          value={get("bodyType")}
          onChange={set("bodyType")}
        />
      </FilterSection>

      <FilterSection title="Двигатель">
        <ChipGroup
          options={fuelOptions}
          value={get("fuel")}
          onChange={set("fuel")}
        />
      </FilterSection>

      <FilterSection title="Коробка передач">
        <Segmented
          anyLabel="Любая"
          options={transmissionOptions}
          value={get("transmission")}
          onChange={set("transmission")}
        />
      </FilterSection>

      <FilterSection title="Привод">
        <ChipGroup
          options={driveOptions}
          value={get("drive")}
          onChange={set("drive")}
        />
      </FilterSection>

      <FilterSection title="Продавец">
        <Segmented
          anyLabel="Все"
          options={sellerOptions}
          value={get("sellerType")}
          onChange={set("sellerType")}
        />
      </FilterSection>
    </div>
  );
}
