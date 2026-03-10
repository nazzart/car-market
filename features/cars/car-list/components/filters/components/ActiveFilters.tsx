"use client";

import FilterChip from "./FilterChip";

type ChipItem = {
  id: string;
  label: string;
};

export default function ActiveFilters() {
  const filters: ChipItem[] = [
    { id: "brand", label: "Audi" },
    { id: "model", label: "A5" },
    { id: "year", label: "Год от 2020" },
    { id: "awd", label: "Полный привод" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {filters.map((filter) => (
        <FilterChip
          key={filter.id}
          label={filter.label}
          onDelete={() => console.log("remove", filter.id)}
        />
      ))}
    </div>
  );
}
