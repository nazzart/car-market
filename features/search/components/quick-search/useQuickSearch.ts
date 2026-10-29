"use client";

import { useRef, useState } from "react";

import { modelsByBrand } from "@/features/brands/data/models";
import { useListingStats, useSearchCount } from "@/features/cars/hooks";
import { withQuery } from "@/lib/url";
import { useDebouncedValue } from "@/lib/useDebounced";

export type Panel = "brand" | "model" | "price" | "year";

const emptyFilters = { condition: "", brand: "", model: "", priceFrom: "", priceTo: "", yearFrom: "" };
export type QuickFilters = typeof emptyFilters;

// Состояние быстрого поиска на главной: фильтры, открытая панель и число подходящих объявлений
export function useQuickSearch() {
  const { total } = useListingStats();
  const modelRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState(emptyFilters);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [brandQuery, setBrandQuery] = useState("");

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
    set({ brand: slug, model: "" });
    setBrandQuery("");
    // сразу предлагаем выбрать модель
    if (slug && modelsByBrand[slug] && modelRef.current) openPanel("model", modelRef.current);
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
    models: modelsByBrand[filters.brand] ?? [],
    count,
    total,
    href: withQuery("/cars", "", filters),
  };
}

export type QuickSearchState = ReturnType<typeof useQuickSearch>;
