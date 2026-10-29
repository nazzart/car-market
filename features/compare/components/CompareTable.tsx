"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";

import type { Listing } from "@/features/cars/types";
import { cn } from "@/lib/utils";

import { MAX_COMPARE } from "../store";
import AddSlot from "./AddSlot";
import CarHeader from "./CarHeader";
import type { CompareSection } from "../types";
import { bestValue } from "./rows";

type CompareTableProps = {
  cars: Listing[];
  sections: CompareSection[];
  onlyDiff: boolean;
  favoritesCount: number;
  onAddFavorites: () => void;
};

// Таблица сравнения: машины в шапке (прилипает к верху), ниже — разделы со строками; лучшее значение выделено
export default function CompareTable({
  cars,
  sections,
  onlyDiff,
  favoritesCount,
  onAddFavorites,
}: CompareTableProps) {
  const t = useTranslations("compare");

  const header = useRef<HTMLDivElement>(null);
  // шапка с машинами прилипает к верху и прокручивается по горизонтали вместе с таблицей
  const syncScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (header.current) header.current.scrollLeft = e.currentTarget.scrollLeft;
  };

  // колонка «добавить», пока есть место
  const slots = cars.length < MAX_COMPARE ? cars.length + 1 : cars.length;
  // на телефоне — две машины в ширину экрана, остальные листаются вбок
  // На телефоне колонки подписей нет — подпись строки стоит над значениями, а машинам отдана вся ширина.
  // --n — число колонок с машинами (плюс «добавить», пока есть место)
  const sizes = "[--car-col:150px] sm:[--label-col:200px] sm:[--car-col:180px]";
  const vars = { "--n": slots } as React.CSSProperties;
  const gridClass =
    "grid grid-cols-[repeat(var(--n),minmax(var(--car-col),1fr))] sm:grid-cols-[var(--label-col)_repeat(var(--n),minmax(var(--car-col),1fr))]";
  const minWidthClass =
    "min-w-[calc(var(--n)*var(--car-col))] sm:min-w-[calc(var(--label-col)+var(--n)*var(--car-col))]";

  return (
    <>
      {/* Машины — прилипают к верху при прокрутке */}

      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-gray-200 -mx-4 px-4">
        <div ref={header} className={cn("overflow-hidden", sizes)} style={vars}>
          <div className={cn(gridClass, minWidthClass)}>
            <div className="hidden sm:block py-3 pr-3 text-xs text-gray-500 self-end">
              {cars.length === 1 && t("addOneMore")}
            </div>

            {cars.map((l) => (
              <CarHeader key={l.id} listing={l} />
            ))}

            {cars.length < MAX_COMPARE && (
              <AddSlot favoritesCount={favoritesCount} onAddFavorites={onAddFavorites} />
            )}
          </div>
        </div>
      </div>

      {/* Таблица */}

      {cars.length === 1 && <p className="sm:hidden mt-3 text-sm text-gray-500">{t("addOneMore")}</p>}

      <div className={cn("overflow-x-auto -mx-4 px-4 scrollbar-thin", sizes)} style={vars} onScroll={syncScroll}>
        <div className={minWidthClass}>
          {sections.map((section) => (
            <section key={section.key}>
              <h2 className="sticky left-0 w-max pt-8 pb-2 text-lg font-semibold tracking-tight">{section.title}</h2>

              {section.rows.map((row) => {
                const best = bestValue(row, cars);

                return (
                  <div key={row.key} className="border-b border-gray-100 hover:bg-gray-50/70">
                    {/* подпись над значениями — только на телефоне; прилипает к левому краю при прокрутке */}
                    <div className="sm:hidden sticky left-0 w-max px-2 pt-3 text-xs text-gray-500">{row.label}</div>

                    <div className={gridClass}>
                      <div className="hidden sm:flex sticky left-0 z-10 bg-white py-3 pr-3 items-center text-sm text-gray-500">{row.label}</div>

                      {cars.map((l) => {
                        const isBest = best !== undefined && row.value(l) === best;

                        return (
                          <div
                            key={l.id}
                            className={cn(
                              "pt-1 pb-3 sm:py-3 px-2 sm:px-3 text-sm flex flex-wrap items-center gap-y-1",
                              isBest ? "font-semibold text-success" : "text-gray-900"
                            )}
                          >
                            {row.display(l)}
                            {isBest && (
                              <span className="hidden sm:inline ml-2 px-1.5 py-0.5 rounded-md bg-success-soft text-[11px] font-medium">
                                {t("best")}
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {cars.length < MAX_COMPARE && <div />}
                    </div>
                  </div>
                );
              })}
            </section>
          ))}

          {onlyDiff && sections.length === 0 && (
            <p className="py-12 text-center text-gray-500">{t("noDiff")}</p>
          )}
        </div>
      </div>
    </>
  );
}
