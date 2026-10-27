"use client";

import { Drawer } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useCarFilters } from "../hooks/useCarFilters";
import FiltersPanel from "./FiltersPanel";

type Props = {
  open: boolean;
  onClose: () => void;
  resultsLabel: string;
};

// Фильтры на мобильных — нижняя шторка с той же панелью, что и в сайдбаре
export default function MobileFiltersDrawer({ open, onClose, resultsLabel }: Props) {
  const { resetFilters, activeCount } = useCarFilters();

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "90vh",
          },
        },
      }}
    >
      <div className="flex flex-col max-h-[90vh]">
        {/* Header */}

        <div className="relative flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <span className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-200" />

          <h2 className="text-lg font-semibold">Фильтры</h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Body */}

        <div className="flex-1 overflow-y-auto px-5">
          <FiltersPanel />
        </div>

        {/* Footer */}

        <div className="flex items-center gap-3 p-4 border-t border-gray-100">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 h-12 text-sm font-medium text-gray-700 hover:text-black cursor-pointer"
            >
              Сбросить
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer"
          >
            Показать {resultsLabel}
          </button>
        </div>
      </div>
    </Drawer>
  );
}
