"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import SearchIcon from "@mui/icons-material/Search";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ViewListIcon from "@mui/icons-material/ViewList";

import { brands } from "@/features/brands/data/brands";
import { cityLabel } from "@/lib/cities";
import { Segmented, Select, inputClass } from "@/features/cars/car-list/components/ui";
import { usePathname, useRouter } from "@/i18n/navigation";

import { getOpenStatus, useNow } from "../lib/openStatus";
import { useDealers } from "../useDealers";
import DealerCard from "./DealerCard";
import type { MapBounds } from "./DealersMap";

// Leaflet работает только в браузере
const DealersMap = dynamic(() => import("./DealersMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" />,
});

const dealerTypes = ["official", "used"];

const inBounds = (lat: number, lng: number, b: MapBounds) =>
  lat <= b.north && lat >= b.south && lng <= b.east && lng >= b.west;

export default function DealersView() {
  // Фильтры в URL, как на /cars: ссылкой можно поделиться, «Назад» их сохраняет
  const t = useTranslations("dealers");
  const tCommon = useTranslations("common");
  const tOptions = useTranslations("options");

  const router = useRouter();
  const pathname = usePathname();

  const dealers = useDealers();

  const typeOptions = dealerTypes.map((value) => ({ value, label: t(`types.${value}`) }));
  const cityOptions = [...new Set(dealers.map((d) => d.city))]
    .map((value) => ({ value, label: cityLabel(tOptions, value) }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // В фильтре — только марки, у которых есть официальные дилеры
  const brandOptions = [...new Set(dealers.flatMap((d) => d.brands))]
    .map((slug) => ({ label: brands.find((b) => b.slug === slug)?.name ?? slug, value: slug }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const params = useSearchParams();

  const query = params.get("q") ?? "";
  const type = params.get("type") ?? "";
  const city = params.get("city") ?? "";
  const brand = params.get("brand") ?? "";
  const openNow = params.get("open") === "1";
  const now = useNow();

  const setParam = (key: string) => (value: string | null) => {
    const next = new URLSearchParams(params.toString());

    if (value) next.set(key, value);
    else next.delete(key);

    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const setQuery = setParam("q");
  const setType = setParam("type");
  const setCity = setParam("city");
  const setBrand = setParam("brand");
  const setOpenNow = (value: boolean) => setParam("open")(value ? "1" : null);

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
        (!brand || d.brands.includes(brand)) &&
        // «Открыто сейчас» работает после гидратации, когда известно время
        (!openNow || now === null || getOpenStatus(d.hours, now).open)
    );
  }, [dealers, query, type, city, brand, openNow, now]);

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
    router.replace(pathname, { scroll: false });
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
          {t("title")}
        </h1>
        <p className="text-gray-500 mt-1">{t("subtitle", { count: dealers.length })}</p>
      </div>

      {/* Filters */}

      <div className="grid grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_1fr_1fr_auto_auto] gap-2 mb-6">
        <div className="relative col-span-2 lg:col-span-1">
          <SearchIcon
            fontSize="small"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search")}
            aria-label={t("searchAria")}
            className={`${inputClass} pl-9`}
          />
        </div>

        <Select label={t("city")} placeholder={t("allCities")} options={cityOptions} value={city} onChange={setCity} />

        <Select
          label={t("brand")}
          placeholder={t("brandPlaceholder")}
          options={brandOptions}
          value={brand}
          onChange={setBrand}
        />

        <div className="col-span-2 lg:col-span-1 flex flex-wrap sm:flex-nowrap gap-2">
          <div className="basis-full sm:basis-auto sm:flex-1 lg:w-80">
            <Segmented
              anyLabel={t("all")}
              options={typeOptions}
              value={type}
              onChange={setType}
            />
          </div>

          <button
            type="button"
            aria-pressed={openNow}
            onClick={() => setOpenNow(!openNow)}
            className={`shrink-0 inline-flex items-center gap-2 h-11 px-4 rounded-xl border text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              openNow
                ? "bg-emerald-50 border-emerald-600 text-emerald-800"
                : "border-gray-200 text-gray-700 hover:border-gray-900"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${openNow ? "bg-emerald-500" : "bg-gray-300"}`} />
            {t("openNow")}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] gap-6 items-start">
        {/* List */}

        <div className={mobileView === "map" ? "hidden lg:block" : ""}>
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="text-gray-500">
              {t("shown")}{" "}
              <span className="font-medium text-gray-900">{tCommon("companies", { count: visible.length })}</span>
            </span>

            {(query || type || city || brand || openNow || searchOnMove) && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-gray-600 hover:text-black hover:underline underline-offset-4 cursor-pointer"
              >
                {tCommon("reset")}
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <div className="text-center py-14 px-6 rounded-2xl border border-dashed border-gray-200">
              <StorefrontOutlinedIcon sx={{ fontSize: 44 }} className="text-gray-300" />
              <h3 className="font-semibold mt-3">{t("notFound")}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {searchOnMove
                  ? t("moveMap")
                  : t("changeFilters")}
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
          id="dealers-map"
          className={`
            ${mobileView === "list" ? "hidden lg:block" : ""}
            relative isolate
            h-[calc(100svh-8rem)] lg:h-[calc(100vh-6rem)]
            lg:sticky lg:top-20
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
            {t("searchOnMove")}
          </label>
        </div>
      </div>

      {/* Mobile: плавающий переключатель список / карта, как на Airbnb */}

      <button
        type="button"
        onClick={() => {
          const next = mobileView === "map" ? "list" : "map";
          setMobileView(next);
          // карта ниже фильтров — сразу показываем её целиком
          requestAnimationFrame(() =>
            next === "map"
              ? document.getElementById("dealers-map")?.scrollIntoView({ block: "end" })
              : window.scrollTo({ top: 0 })
          );
        }}
        className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] inline-flex items-center gap-2 h-12 px-5 rounded-full bg-gray-900 text-white text-sm font-semibold shadow-xl shadow-black/25 cursor-pointer"
      >
        {mobileView === "map" ? <ViewListIcon fontSize="small" /> : <MapOutlinedIcon fontSize="small" />}
        {mobileView === "map" ? t("list") : t("map")}
      </button>
    </div>
  );
}
