"use client";

import SearchOffIcon from "@mui/icons-material/SearchOff";

import { useCarFilters } from "../hooks/useCarFilters";

export default function EmptyResults() {
  const { resetFilters } = useCarFilters();

  return (
    <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-gray-200">
      <SearchOffIcon sx={{ fontSize: 48 }} className="text-gray-300" />

      <h3 className="text-lg font-semibold mt-3">Ничего не найдено</h3>

      <p className="text-gray-500 mt-1">
        Попробуйте изменить или сбросить фильтры
      </p>

      <button
        type="button"
        onClick={resetFilters}
        className="mt-5 px-5 py-2.5 rounded-full bg-gray-900 hover:bg-black text-white text-sm font-medium transition cursor-pointer"
      >
        Сбросить фильтры
      </button>
    </div>
  );
}
