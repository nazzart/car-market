"use client";

import { Checkbox, Button, FormControlLabel } from "@mui/material";

import BrandModelSection from "./BrandModelSection";
import FiltersGrid from "./FiltersGrid";
import ActiveFilters from "./ActiveFilters";

export default function FiltersBar() {
  return (
    <div className="w-full flex">
      <div className="w-full py-8">
        <h1 className="text-2xl font-semibold mb-8">Купить автомобиль</h1>

        <div
          className="
          shadow-[0_2px_16px_#1314161f]
          rounded-xl
          p-8

          
        "
        >
          {/* Brand + Model */}
          <BrandModelSection />

          {/* Other filters */}
          <FiltersGrid />

          {/* Active filters + reset */}
          <div className="flex items-start justify-between mt-5">
            <div className="flex flex-wrap gap-2">
              <ActiveFilters />
            </div>

            <button className="text-red-500 text-sm hover:underline">
              Сбросить фильтры
            </button>
          </div>

          {/* Bottom row */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-6 items-center">
              <Button variant="text">Все параметры</Button>

              <FormControlLabel control={<Checkbox />} label="На заказ" />
            </div>

            <Button
              variant="contained"
              size="large"
              className="
                !bg-black
                !rounded-lg
                hover:!bg-gray-900
                !px-6
              "
            >
              Показать 643 942 предложения
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
