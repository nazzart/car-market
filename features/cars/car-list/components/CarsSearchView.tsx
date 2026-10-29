"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import TuneIcon from "@mui/icons-material/Tune";
import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import PageHeader from "@/components/ui/PageHeader";
import { brands } from "@/features/brands/data/brands";
import { collections } from "@/features/collections/config";
import { useDealerLookup } from "@/features/dealers/hooks";
import CollectionPills from "@/features/collections/components/CollectionPills";
import CarCard from "@/features/latest-cars/components/CarCard";
import Pagination from "@/components/ui/Pagination";

import { SearchTransitionContext, useCarFilters } from "../hooks/useCarFilters";
import { sortValues } from "../../config/filterOptions";
import type { Listing } from "../../types";
import ActiveFilterChips from "./ActiveFilterChips";
import EmptyResults from "./EmptyResults";
import FiltersPanel from "./FiltersPanel";
import ListingRow from "./ListingRow";
import MobileFiltersDrawer from "./MobileFiltersDrawer";
import ScrollArea from "./ScrollArea";
import { useVisibility } from "@/features/moderation/visibility";
import { inputClass } from "@/components/ui/form";

// Сайдбар всегда целиком в окне: пока он не прилип, высота — до нижнего края экрана.
// Так низ панели и подсказка «Ещё фильтры» видны сразу, без прокрутки страницы
// top — отступ прилипания под шапкой (top-20 = 80px)
function useFitToViewport<T extends HTMLElement>(top = 80, gap = 16) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const offset = Math.max(el.getBoundingClientRect().top, top);
      el.style.maxHeight = `${window.innerHeight - offset - gap}px`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [top, gap]);

  return ref;
}

type CountBadgeProps = { count: number; inverted?: boolean };

function CountBadge({ count, inverted }: CountBadgeProps) {
  return (
    <span
      className={`min-w-5 h-5 px-1.5 rounded-full text-xs font-semibold flex items-center justify-center ${
        inverted ? "bg-white text-gray-900" : "bg-primary text-white"
      }`}
    >
      {count}
    </span>
  );
}

const views = [
  { value: "list", label: "viewList", icon: ViewAgendaOutlinedIcon },
  { value: "grid", label: "viewGrid", icon: GridViewOutlinedIcon },
];

// Одна страница результатов, посчитанная сервером (searchListings в features/cars/api.ts)
export type SearchResultProps = {
  result: { items: Listing[]; total: number; page: number; pageCount: number };
  pageSize: number;
  // ничего не нашлось: какой фильтр убрать (и сколько тогда будет) и свежие объявления
  empty?: { suggestions: { key: string; count: number }[]; fresh: Listing[] };
};

export default function CarsSearchView(props: SearchResultProps) {
  // смена фильтров — переход в transition: пока сервер готовит новую страницу, старая видна затемнённой
  const [pending, startTransition] = useTransition();

  return (
    <SearchTransitionContext.Provider value={startTransition}>
      <SearchView {...props} pending={pending} />
    </SearchTransitionContext.Provider>
  );
}

type SearchViewProps = SearchResultProps & { pending: boolean };

function SearchView({ result, pageSize, empty, pending }: SearchViewProps) {
  const t = useTranslations("cars");
  const tCommon = useTranslations("common");
  const tOptions = useTranslations("options");
  const { params, updateFilter, resetFilters, activeCount } = useCarFilters();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sidebarRef = useFitToViewport<HTMLElement>();

  // скрытые, проданные и удалённые продавцом — не в поиске.
  // TODO(backend): статусы и модерация сейчас в браузере — перенести в базу и фильтровать в SQL
  const { isPublic } = useVisibility();
  const dealerOf = useDealerLookup();
  const results = result.items.filter(isPublic);
  const view = params.get("view") === "grid" ? "grid" : "list";

  const resultsLabel = tCommon("listings", { count: result.total });

  // Заголовок отражает поиск: «BMW M4», «Электромобили» или общий
  const brandName = brands.find((b) => b.slug === params.get("brand"))?.name;
  const collection = collections.find((c) => c.slug === params.get("collection"));

  const dealerName = dealerOf(params.get("dealer"))?.name;

  const title = dealerName
    ? t("dealerCars", { dealer: dealerName })
    : brandName
    ? [brandName, params.get("model")].filter(Boolean).join(" ")
    : collection
    ? tOptions(`collections.${collection.slug}.label`)
    : t("title");

  return (
    <div className="pt-6 pb-12">
      {/* Header */}

      <PageHeader title={title} subtitle={t("resultsIn", { count: result.total })} className="mb-5" />

      <div className="mb-8">
        <CollectionPills />
      </div>

      <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
        {/* Sidebar (desktop) */}

        <aside
          ref={sidebarRef}
          className="hidden lg:flex flex-col sticky top-20 max-h-[calc(100vh-6rem)] rounded-panel border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="shrink-0 flex items-center justify-between gap-3 px-5 h-14 border-b border-gray-100">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <TuneIcon fontSize="small" />
              {t("filters")}
              {activeCount > 0 && <CountBadge count={activeCount} />}
            </h2>

            {activeCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm text-gray-600 hover:text-black hover:underline underline-offset-4 cursor-pointer"
              >
                {tCommon("reset")}
              </button>
            )}
          </div>

          <ScrollArea moreLabel={t("moreFilters")} className="px-5">
            <FiltersPanel />
          </ScrollArea>
        </aside>

        {/* Results */}

        <div className="min-w-0">
          {/* Toolbar — на мобильных прилипает под шапкой, чтобы фильтры были под рукой */}

          <div className="sticky top-16 z-30 -mx-4 px-4 py-2 bg-white/90 backdrop-blur-lg border-b border-gray-100 lg:static lg:z-auto lg:mx-0 lg:p-0 lg:bg-transparent lg:backdrop-blur-none lg:border-0 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className={`lg:hidden shrink-0 inline-flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeCount > 0
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              <TuneIcon fontSize="small" />
              {t("filters")}
              {activeCount > 0 && <CountBadge count={activeCount} inverted />}
            </button>

            {/* Число объявлений уже под заголовком — здесь активные фильтры */}
            <div className="hidden lg:block flex-1 min-w-0">
              <ActiveFilterChips />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  aria-label={t("sort")}
                  value={params.get("sort") ?? ""}
                  onChange={(e) => updateFilter("sort", e.target.value || null)}
                  className={`${inputClass} appearance-none pr-9 cursor-pointer w-auto max-w-[200px] sm:max-w-none`}
                >
                  {sortValues.map((value) => (
                    <option key={value} value={value}>
                      {tOptions(`sort.${value || "newest"}`)}
                    </option>
                  ))}
                </select>

                <KeyboardArrowDownIcon
                  fontSize="small"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>

              <div className="hidden sm:flex p-1 rounded-xl bg-gray-100">
                {views.map((v) => {
                  const Icon = v.icon;
                  const active = view === v.value;

                  return (
                    <button
                      key={v.value}
                      type="button"
                      aria-label={t(v.label)}
                      aria-pressed={active}
                      onClick={() => updateFilter("view", v.value === "list" ? null : v.value)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg transition cursor-pointer ${
                        active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-black"
                      }`}
                    >
                      <Icon fontSize="small" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active filters */}

          <div className="mt-4 empty:hidden lg:hidden">
            <ActiveFilterChips />
          </div>

          {/* List */}

          <div className={`mt-5 transition-opacity ${pending ? "opacity-50 pointer-events-none" : ""}`} aria-busy={pending}>
            {results.length === 0 ? (
              <EmptyResults suggestions={empty?.suggestions ?? []} fresh={empty?.fresh ?? []} />
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8">
                {results.map((listing) => (
                  <CarCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((listing) => (
                  <ListingRow key={listing.id} listing={listing} />
                ))}
              </div>
            )}

            <Pagination path="/cars" page={result.page} pageCount={result.pageCount} total={result.total} pageSize={pageSize} />
          </div>
        </div>
      </div>

      <MobileFiltersDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        resultsLabel={resultsLabel}
      />
    </div>
  );
}
