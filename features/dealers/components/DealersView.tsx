"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import SearchIcon from "@mui/icons-material/Search";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

import { brands } from "@/features/brands/data/brands";
import { Segmented, Select, inputClass } from "@/features/cars/car-list/components/ui";
import { plural } from "@/lib/utils";

import { dealers } from "../data/dealers";
import DealerCard from "./DealerCard";
import type { MapBounds } from "./DealersMap";

// Leaflet работает только в браузере
const DealersMap = dynamic(() => import("./DealersMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" />,
});

const typeOptions = [
  { label: "Официальные", value: "official" },
  { label: "С пробегом", value: "used" },
];

const cityOptions = [...new Set(dealers.map((d) => d.city))]
  .sort((a, b) => a.localeCompare(b))
  .map((city) => ({ label: city, value: city }));

// В фильтре — только марки, у которых есть официальные дилеры
const brandOptions = [...new Set(dealers.flatMap((d) => d.brands))]
  .map((slug) => ({ label: brands.find((b) => b.slug === slug)?.name ?? slug, value: slug }))
  .sort((a, b) => a.label.localeCompare(b.label));

const inBounds = (lat: number, lng: number, b: MapBounds) =>
  lat <= b.north && lat >= b.south && lng <= b.east && lng >= b.west;

const pluralDealers = (n: number) =>
  `${n} ${plural(n, ["компания", "компании", "компаний"])}`;

export default function DealersView() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [brand, setBrand] = useState("");

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [searchOnMove, setSearchOnMove] = useState(false);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [mobileView, setMobileView] = useState("list");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return dealers.filter(
      (d) =>
        (!q || d.name.toLowerCase().includes(q) || d.address.toLowerCase().includes(q)) &&
        (!type || d.type === type) &&
        (!city || d.city === city) &&
        (!brand || d.brands.includes(brand))
    );
  }, [query, type, city, brand]);

  // «Искать при перемещении карты» — список показывает только то, что видно на карте
  const visible =
    searchOnMove && bounds ? filtered.filter((d) => inBounds(d.lat, d.lng, bounds)) : filtered;

  // Клик по метке → прокручиваем список к карточке
  useEffect(() => {
    if (activeSlug) {
      document
        .getElementById(`dealer-${activeSlug}`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeSlug]);

  const resetFilters = () => {
    setQuery("");
    setType("");
    setCity("");
    setBrand("");
    setSearchOnMove(false);
  };

  const selectOnMap = (slug: string) => {
    setActiveSlug(slug);
    setMobileView("map");
  };

  return (
    <div className="pt-6 pb-12">
      {/* Header */}

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Дилеры и автосалоны
        </h1>
        <p className="text-gray-500 mt-1">{pluralDealers(dealers.length)} по всей Латвии</p>
      </div>

      {/* Filters */}

      <div className="grid sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_1fr_1fr_auto] gap-2 mb-6">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <SearchIcon
            fontSize="small"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Название или адрес"
            aria-label="Поиск дилера"
            className={`${inputClass} pl-9`}
          />
        </div>

        <Select label="Город" placeholder="Все города" options={cityOptions} value={city} onChange={setCity} />

        <Select
          label="Марка"
          placeholder="Официальный дилер марки"
          options={brandOptions}
          value={brand}
          onChange={setBrand}
        />

        <div className="sm:col-span-2 lg:col-span-1 lg:w-80">
          <Segmented
            anyLabel="Все"
            options={typeOptions}
            value={type}
            onChange={(v) => setType(v ?? "")}
          />
        </div>
      </div>

      {/* Mobile: list / map */}

      <div className="lg:hidden mb-4">
        <Segmented
          anyLabel="Список"
          options={[{ label: "Карта", value: "map" }]}
          value={mobileView === "map" ? "map" : ""}
          onChange={(v) => setMobileView(v ? "map" : "list")}
        />
      </div>

      <div className="grid lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] gap-6 items-start">
        {/* List */}

        <div className={mobileView === "map" ? "hidden lg:block" : ""}>
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="text-gray-500">
              Показано: <span className="font-medium text-gray-900">{pluralDealers(visible.length)}</span>
            </span>

            {(query || type || city || brand || searchOnMove) && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-gray-600 hover:text-black hover:underline underline-offset-4 cursor-pointer"
              >
                Сбросить
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <div className="text-center py-14 px-6 rounded-2xl border border-dashed border-gray-200">
              <StorefrontOutlinedIcon sx={{ fontSize: 44 }} className="text-gray-300" />
              <h3 className="font-semibold mt-3">Дилеры не найдены</h3>
              <p className="text-sm text-gray-500 mt-1">
                {searchOnMove
                  ? "Сдвиньте или отдалите карту, чтобы увидеть больше"
                  : "Попробуйте изменить фильтры"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((dealer) => (
                <DealerCard
                  key={dealer.slug}
                  dealer={dealer}
                  active={dealer.slug === activeSlug}
                  onSelect={() => selectOnMap(dealer.slug)}
                  onHover={(hovered) => setHoveredSlug(hovered ? dealer.slug : null)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Map */}

        <div
          className={`
            ${mobileView === "list" ? "hidden lg:block" : ""}
            relative isolate
            h-[70vh] lg:h-[calc(100vh-7rem)]
            lg:sticky lg:top-24
            rounded-3xl overflow-hidden
            border border-gray-200
          `}
        >
          <DealersMap
            dealers={filtered}
            activeSlug={activeSlug}
            hoveredSlug={hoveredSlug}
            fitKey={`${query}|${type}|${city}|${brand}`}
            onSelect={setActiveSlug}
            onBoundsChange={setBounds}
          />

          <label className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg text-sm font-medium cursor-pointer select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={searchOnMove}
              onChange={(e) => setSearchOnMove(e.target.checked)}
              className="w-4 h-4 accent-gray-900"
            />
            Искать при перемещении карты
          </label>
        </div>
      </div>
    </div>
  );
}
