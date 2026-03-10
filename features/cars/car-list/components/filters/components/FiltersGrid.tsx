"use client";

import FilterSelect from "./FilterSelect";
import RangeFilter from "./RangeFilter";

export default function FiltersGrid() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <FilterSelect
        label="Кузов"
        options={[
          { label: "SUV", value: "suv" },
          { label: "Седан", value: "sedan" },
        ]}
      />

      <FilterSelect
        label="Привод"
        options={[
          { label: "Полный", value: "awd" },
          { label: "Передний", value: "fwd" },
        ]}
      />

      <FilterSelect
        label="Двигатель"
        options={[
          { label: "Бензин", value: "petrol" },
          { label: "Дизель", value: "diesel" },
        ]}
      />

      <FilterSelect
        label="Коробка"
        options={[
          { label: "Автомат", value: "auto" },
          { label: "Механика", value: "manual" },
        ]}
      />

      <RangeFilter labelFrom="Объем от" labelTo="до" />
      <RangeFilter labelFrom="Год от" labelTo="до" />
      <RangeFilter labelFrom="Пробег от" labelTo="до" />
      <RangeFilter labelFrom="Цена от" labelTo="до" />
    </div>
  );
}
