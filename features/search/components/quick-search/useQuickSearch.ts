"use client";

import { useRef, useState } from "react";

import { useFilterModels, useListingStats, useSearchCount } from "@/features/cars/hooks";
import { modelOptions, modelValue } from "@/features/cars/lib/modelOptions";
import { withQuery } from "@/lib/url";
import { useDebouncedValue } from "@/lib/useDebounced";

export type Panel = "brand" | "model" | "price" | "year";

const emptyFilters = { condition: "", brand: "", model: "", version: "", priceFrom: "", priceTo: "", yearFrom: "" };
export type QuickFilters = typeof emptyFilters;

// Состояние быстрого поиска на главной: фильтры, открытая панель и число подходящих объявлений
export function useQuickSearch() {
  const { total, byModel } = useListingStats();
  const modelRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState(emptyFilters);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [brandQuery, setBrandQuery] = useState("");
  const brandModels = useFilterModels(filters.brand);

  const set = (changes: Partial<QuickFilters>) => setFilters((prev) => ({ ...prev, ...changes }));

  // Число на кнопке считает сервер по тем же правилам, что и /cars. Запрос — через 300 мс после последнего
  // изменения, чтобы не спрашивать на каждую введённую цифру цены
  const debounced = useDebouncedValue(filters, 300);
  const hasFilters = Object.values(debounced).some(Boolean);
  const searchCount = useSearchCount(hasFilters ? debounced : {});
  const count = hasFilters ? (searchCount ?? total) : total;

  const openPanel = (name: Panel, el: HTMLElement) => {
    setPanel(name);
    setAnchorEl(el);
  };

  const closePanel = () => {
    setPanel(null);
    setAnchorEl(null);
    setBrandQuery("");
  };

  const selectBrand = (slug: string) => {
    set({ brand: slug, model: "", version: "" });
    setBrandQuery("");
    // сразу предлагаем выбрать модель
    if (slug && modelRef.current) openPanel("model", modelRef.current);
    else closePanel();
  };

  // выбор в панели закрывает её
  const pick = (changes: Partial<QuickFilters>) => {
    set(changes);
    closePanel();
  };

  return {
    filters,
    set,
    pick,
    selectBrand,
    panel,
    anchorEl,
    openPanel,
    closePanel,
    brandQuery,
    setBrandQuery,
    modelRef,
    // модели и версии одним списком: «5 Series», «5 Series · 530»; точные «530d» — по вводу
    models: modelOptions(brandModels ?? [], (model) => byModel[filters.brand]?.[model], modelValue(filters.model, filters.version)),
    count,
    total,
    href: withQuery("/cars", "", filters),
  };
}

export type QuickSearchState = ReturnType<typeof useQuickSearch>;
