"use client";

import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import SearchIcon from "@mui/icons-material/Search";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ViewListIcon from "@mui/icons-material/ViewList";

import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { useBrandName } from "@/features/catalog/hooks";
import { usePlaceName } from "@/lib/places";
import { withQuery } from "@/lib/url";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import { Segmented, Select, inputClass } from "@/components/ui/form";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useDebouncedCallback, useDebouncedValue } from "@/lib/useDebounced";

import type { DealerSearchResult } from "../api";
import DealerCard from "./DealerCard";
import type { DealerFilterOptions, MapBounds, OptionCount } from "../types";

// Leaflet работает только в браузере
const DealersMap = dynamic(() => import("./DealersMap"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

const dealerTypes = ["official", "used"];

// Область карты в URL: «south,west,north,east», 4 знака после запятой (~10 м)
const formatBounds = (b: MapBounds) => [b.south, b.west, b.north, b.east].map((n) => n.toFixed(4)).join(",");

type DealersViewProps = {
  result: DealerSearchResult; // посчитано сервером: страница карточек + метки для карты
  options: DealerFilterOptions;
  totalDealers: number;
  pageSize: number;
};

export default function DealersView({ result, options, totalDealers, pageSize }: DealersViewProps) {
  const brandName = useBrandName();
  // Фильтры в URL, как на /cars: ссылкой можно поделиться, «Назад» их сохраняет, сервер по ним ищет
  const t = useTranslations("dealers");
  const tCommon = useTranslations("common");
  const placeName = usePlaceName();
  const locale = useLocale();

  const router = useRouter();
  const pathname = usePathname();
  // пока сервер готовит новую страницу, старая видна затемнённой
  const [pending, startTransition] = useTransition();

  const typeOptions = dealerTypes.map((value) => ({ value, label: t(`types.${value}`) }));
  // Места и марки — только где есть дилеры, с их числом; края — отдельной группой после городов
  const withCount = (label: string, count: number) => `${label} (${count})`;
  const sorted = <T extends { label: string }>(items: T[]) => items.sort((a, b) => a.label.localeCompare(b.label, locale));
  const placeOptions = (items: OptionCount[], group: string) =>
    sorted(items.map(({ value, count }) => ({ value, label: placeName(value), count }))).map(({ value, label, count }) => ({
      value,
      label: withCount(label, count),
      group,
    }));
  const cityOptions = [
    ...placeOptions(options.cities, tCommon("places.cities")),
    ...placeOptions(options.areas, tCommon("places.municipalities")),
  ];
  const brandOptions = sorted(options.brands.map(({ value, count }) => ({ value, label: brandName(value), count }))).map(
    ({ value, label, count }) => ({ value, label: withCount(label, count) })
  );

  const params = useSearchParams();

  const query = params.get("q") ?? "";
  const type = params.get("type") ?? "";
  const city = params.get("city") ?? "";
  const brand = params.get("brand") ?? "";
  const openNow = params.get("open") === "1";
  // «Искать при перемещении карты» — список показывает только то, что видно на карте
  const searchOnMove = params.has("bounds");

  const setParams = (changes: Record<string, string | null>) => {
    // другие фильтры — снова с первой страницы
    const href = withQuery(pathname, params, { page: null, ...changes });
    startTransition(() => router.replace(href, { scroll: false }));
  };
  const setParam = (key: string) => (value: string | null) => setParams({ [key]: value });

  const setType = setParam("type");
  const setCity = setParam("city");
  const setBrand = setParam("brand");
  const setOpenNow = (value: boolean) => setParam("open")(value ? "1" : null);

  // Поиск по тексту — в URL через 300 мс после последней буквы, а не на каждую
  const [text, setText] = useState(query);
  const lastQuery = useRef(query);
  const debouncedText = useDebouncedValue(text.trim(), 300);
  const pushQuery = useEffectEvent((value: string) => {
    if (value === lastQuery.current) return;
    lastQuery.current = value;
    setParam("q")(value || null);
  });
  useEffect(() => pushQuery(debouncedText), [debouncedText]);

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState("list");

  // Карта двигается → при включённом поиске по карте обновляем область в URL (после остановки, раз в 400 мс)
  const bounds = useRef<MapBounds | null>(null);
  const pushBounds = useDebouncedCallback((next: MapBounds) => {
    const value = formatBounds(next);
    if (value !== params.get("bounds")) setParam("bounds")(value);
  }, 400);
  const onBoundsChange = (next: MapBounds) => {
    bounds.current = next;
    if (searchOnMove) pushBounds.call(next);
  };
  const setSearchOnMove = (on: boolean) =>
    setParam("bounds")(on && bounds.current ? formatBounds(bounds.current) : null);

  const visible = result.items;
  const pins = result.pins;

  // Клик по метке → прокручиваем список к карточке
  useEffect(() => {
    if (activeSlug) {
      document
        .getElementById(`dealer-${activeSlug}`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeSlug]);

  const resetFilters = () => {
    lastQuery.current = "";
    setText("");
    startTransition(() => router.replace(pathname, { scroll: false }));
  };

  const selectOnMap = (slug: string) => {
    setActiveSlug(slug);
    setMobileView("map");
  };

  return (
    <div className="pt-6 pb-12">
      {/* Header */}

      <PageHeader title={t("title")} subtitle={t("subtitle", { count: totalDealers })} />

      {/* Filters */}

      <div className="grid grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_1fr_1fr_auto_auto] gap-2 mb-6">
        <div className="relative col-span-2 lg:col-span-1">
          <SearchIcon
            fontSize="small"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
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
                ? "bg-success-soft border-success-accent text-success-strong"
                : "border-gray-200 text-gray-700 hover:border-gray-900"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${openNow ? "bg-success-solid" : "bg-gray-300"}`} />
            {t("openNow")}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] gap-6 items-start">
        {/* List */}

        <div
          className={`${mobileView === "map" ? "hidden lg:block" : ""} transition-opacity ${pending ? "opacity-50 pointer-events-none" : ""}`}
          aria-busy={pending}
        >
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="text-gray-500">
              {t("shown")}{" "}
              <span className="font-medium text-gray-900">{tCommon("companies", { count: result.total })}</span>
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
            <EmptyState
              icon={StorefrontOutlinedIcon}
              title={t("notFound")}
              text={searchOnMove ? t("moveMap") : t("changeFilters")}
            />
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

          <Pagination path="/dealers" page={result.page} pageCount={result.pageCount} total={result.total} pageSize={pageSize} />
        </div>

        {/* Map */}

        <div
          id="dealers-map"
          className={`
            ${mobileView === "list" ? "hidden lg:block" : ""}
            relative isolate
            h-[calc(100svh-8rem)] lg:h-[calc(100vh-6rem)]
            lg:sticky lg:top-20
            rounded-panel overflow-hidden
            border border-gray-200
          `}
        >
          <DealersMap
            dealers={pins}
            activeSlug={activeSlug}
            hoveredSlug={hoveredSlug}
            fitKey={`${query}|${type}|${city}|${brand}`}
            onSelect={setActiveSlug}
            onBoundsChange={onBoundsChange}
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

      <Button
        variant="dark"
        size="lg"
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
        className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] text-sm shadow-xl shadow-black/25"
      >
        {mobileView === "map" ? <ViewListIcon fontSize="small" /> : <MapOutlinedIcon fontSize="small" />}
        {mobileView === "map" ? t("list") : t("map")}
      </Button>
    </div>
  );
}
