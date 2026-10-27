"use client";

import CloseIcon from "@mui/icons-material/Close";

import { useCarFilters } from "../hooks/useCarFilters";
import { FILTER_KEYS, chipLabel } from "../../config/filterOptions";

export default function ActiveFilterChips() {
  const { params, updateFilter, resetFilters } = useCarFilters();

  // подборку показывают пилюли над поиском — здесь её не дублируем
  const chips = FILTER_KEYS.filter((key) => key !== "collection").flatMap(
    (key) => {
      const value = params.get(key);
      return value ? [{ key, label: chipLabel(key, value) }] : [];
    }
  );

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => updateFilter(chip.key, null)}
          aria-label={`Убрать фильтр: ${chip.label}`}
          className="
            inline-flex items-center gap-1
            pl-3 pr-2 py-1
            rounded-full
            bg-gray-900 hover:bg-black
            text-sm text-white
            transition
            cursor-pointer
          "
        >
          {chip.label}
          <CloseIcon sx={{ fontSize: 14 }} className="opacity-70" />
        </button>
      ))}

      <button
        type="button"
        onClick={resetFilters}
        className="px-1 text-sm text-gray-600 hover:text-black hover:underline underline-offset-4 cursor-pointer"
      >
        Сбросить всё
      </button>
    </div>
  );
}
