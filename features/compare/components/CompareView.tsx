"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Switch } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import { useTranslations } from "next-intl";

import { equipmentGroups } from "@/features/cars/config/equipment";
import { Listing, OVERALL_CONDITIONS, SERVICE_STATES } from "@/features/cars/types";
import { useListingsByIds } from "@/features/cars/hooks";
import { useDealerLookup } from "@/features/dealers/hooks";
import { useFavorites } from "@/features/favorites/store";
import { Link } from "@/i18n/navigation";
import { cn, formatNumber } from "@/lib/utils";
import { usePlaceName } from "@/lib/places";

import { MAX_COMPARE, addToCompare, clearCompare, removeFromCompare, useCompare } from "../store";

// true только в браузере после гидратации — до этого список сравнения ещё не прочитан
const noop = () => () => {};
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

/* ---------- Строки таблицы ---------- */

type Row = {
  key: string;
  label: string;
  display: (l: Listing) => React.ReactNode;
  // значение для поиска лучшего и сравнения «есть ли отличия»
  value: (l: Listing) => string | number | undefined;
  best?: "min" | "max";
};

type Section = { key: string; title: string; rows: Row[] };

// «06.2027» → 202706, чтобы сравнивать даты техосмотра
const monthValue = (date?: string) => {
  if (!date) return undefined;
  const [month, year] = date.split(".");
  return Number(year) * 100 + Number(month);
};

const damagedParts = (l: Listing) => (l.damages ? Object.keys(l.damages).length : undefined);

// лучшее значение в строке; нет лучшего, если все равны или данных мало
function bestValue(row: Row, cars: Listing[]) {
  if (!row.best || cars.length < 2) return undefined;
  const values = cars.map(row.value).filter((v): v is number => typeof v === "number");
  if (values.length < 2 || new Set(values).size < 2) return undefined;
  return row.best === "min" ? Math.min(...values) : Math.max(...values);
}

export default function CompareView() {
  const t = useTranslations("compare");
  const tSpecs = useTranslations("listing.specs");
  const tCommon = useTranslations("common");
  const tOptions = useTranslations("options");
  const placeName = usePlaceName();
  const hydrated = useHydrated();
  const ids = useCompare();
  const { entries: favorites } = useFavorites();
  const [onlyDiff, setOnlyDiff] = useState(false);

  // одним запросом — машины в сравнении и избранное (чтобы предложить добавить его)
  const loaded = useListingsByIds([...new Set([...ids, ...favorites.map((f) => f.id)])]);
  const listingOf = (id: string) => loaded?.find((l) => l.id === id);
  const cars = ids.map(listingOf).filter((l) => l !== undefined);
  const dealerOf = useDealerLookup();

  const header = useRef<HTMLDivElement>(null);
  // шапка с машинами прилипает к верху и прокручивается по горизонтали вместе с таблицей
  const syncScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (header.current) header.current.scrollLeft = e.currentTarget.scrollLeft;
  };

  if (!hydrated || loaded === undefined) return <div className="h-96 my-6 rounded-3xl bg-gray-50 animate-pulse" />;

  const favoritesToAdd = favorites.filter((f) => !ids.includes(f.id) && listingOf(f.id) !== undefined);

  const addFromFavorites = () => {
    for (const f of favoritesToAdd) if (!addToCompare(f.id)) break;
  };

  if (cars.length === 0) return <EmptyState favoritesCount={favoritesToAdd.length} onAddFavorites={addFromFavorites} />;

  const dash = <span className="text-gray-300">—</span>;
  const yesNo = (v?: boolean) => (v === undefined ? dash : v ? t("yes") : t("no"));

  const sections: Section[] = [
    {
      key: "main",
      title: t("sections.main"),
      rows: [
        { key: "price", label: t("rows.price"), display: (l) => `${formatNumber(l.price)} €`, value: (l) => l.price, best: "min" },
        { key: "year", label: tSpecs("year"), display: (l) => l.year, value: (l) => l.year, best: "max" },
        {
          key: "mileage",
          label: tSpecs("mileage"),
          display: (l) => `${formatNumber(l.mileage)} ${tCommon("units.km")}`,
          value: (l) => l.mileage,
          best: "min",
        },
        {
          key: "condition",
          label: tSpecs("condition"),
          display: (l) => (l.condition === "new" ? tSpecs("conditionNew") : tSpecs("conditionUsed")),
          value: (l) => l.condition,
        },
        { key: "city", label: t("rows.city"), display: (l) => placeName(l.city), value: (l) => l.city },
        {
          key: "seller",
          label: t("rows.seller"),
          display: (l) =>
            l.dealer ? (dealerOf(l.dealer)?.name ?? l.sellerName) : t("privateSeller"),
          value: (l) => l.dealer ?? "private",
        },
      ],
    },
    {
      key: "engine",
      title: t("sections.engine"),
      rows: [
        {
          key: "engine",
          label: tSpecs("engine"),
          display: (l) => (l.engine ? `${l.engine.toFixed(1)} ${tCommon("units.liters")}` : dash),
          value: (l) => l.engine ?? undefined,
        },
        {
          key: "power",
          label: tSpecs("power"),
          display: (l) => `${l.power} ${tCommon("units.hp")}`,
          value: (l) => l.power,
          best: "max",
        },
        { key: "fuel", label: tSpecs("fuel"), display: (l) => tOptions(`fuel.${l.fuel}`), value: (l) => l.fuel },
        {
          key: "gearbox",
          label: tSpecs("gearbox"),
          display: (l) => tOptions(`transmission.${l.transmission}`),
          value: (l) => l.transmission,
        },
        { key: "drive", label: tSpecs("drive"), display: (l) => tOptions(`drive.${l.drive}`), value: (l) => l.drive },
      ],
    },
    {
      key: "body",
      title: t("sections.body"),
      rows: [
        { key: "body", label: tSpecs("body"), display: (l) => tOptions(`bodyType.${l.bodyType}`), value: (l) => l.bodyType },
        {
          key: "color",
          label: tSpecs("color"),
          display: (l) => (l.color ? tOptions(`colors.${l.color}`) : dash),
          value: (l) => l.color,
        },
      ],
    },
    {
      key: "history",
      title: t("sections.history"),
      rows: [
        { key: "owners", label: tSpecs("owners"), display: (l) => l.owners ?? dash, value: (l) => l.owners, best: "min" },
        {
          key: "noAccidents",
          label: t("rows.noAccidents"),
          display: (l) => yesNo(l.noAccidents),
          value: (l) => (l.noAccidents === undefined ? undefined : String(l.noAccidents)),
        },
        {
          key: "damages",
          label: t("rows.damages"),
          display: (l) => {
            const n = damagedParts(l);
            return n === undefined ? dash : n === 0 ? t("noDamages") : t("damagedParts", { count: n });
          },
          value: damagedParts,
          best: "min",
        },
        {
          key: "overallCondition",
          label: tSpecs("overallCondition"),
          display: (l) => (l.overallCondition ? tOptions(`overallCondition.${l.overallCondition}`) : dash),
          value: (l) => (l.overallCondition ? OVERALL_CONDITIONS.indexOf(l.overallCondition) : undefined),
          best: "min",
        },
        {
          key: "service",
          label: tSpecs("service"),
          display: (l) => (l.service ? tOptions(`service.${l.service}`) : dash),
          value: (l) => (l.service ? SERVICE_STATES.indexOf(l.service) : undefined),
          best: "min",
        },
        {
          key: "serviceBook",
          label: tSpecs("serviceBook"),
          display: (l) => (l.serviceBook === undefined ? dash : l.serviceBook ? tSpecs("yes") : tSpecs("no")),
          value: (l) => (l.serviceBook === undefined ? undefined : String(l.serviceBook)),
        },
        {
          key: "mileageLatvia",
          label: tSpecs("mileageLatvia"),
          display: (l) => (l.mileageLatvia ? tOptions(`mileageLatvia.${l.mileageLatvia}`) : dash),
          value: (l) => l.mileageLatvia,
        },
        {
          key: "inspection",
          label: tSpecs("inspection"),
          display: (l) => (l.inspectionUntil ? tSpecs("inspectionUntil", { date: l.inspectionUntil }) : dash),
          value: (l) => monthValue(l.inspectionUntil),
          best: "max",
        },
      ],
    },
    {
      key: "equipment",
      title: t("sections.equipment"),
      rows: [
        {
          key: "equipmentCount",
          label: t("rows.equipmentCount"),
          display: (l) => l.equipment?.length ?? 0,
          value: (l) => l.equipment?.length ?? 0,
          best: "max",
        },
        // только опции, которые есть хотя бы у одной машины, в порядке групп
        ...Object.values(equipmentGroups)
          .flat()
          .filter((key) => cars.some((l) => l.equipment?.includes(key)))
          .map<Row>((key) => ({
            key: `eq-${key}`,
            label: tOptions(`equipment.${key}`),
            display: (l) =>
              l.equipment?.includes(key) ? (
                <CheckIcon fontSize="small" className="text-emerald-600" aria-label={t("yes")} />
              ) : (
                <RemoveIcon fontSize="small" className="text-gray-300" aria-label={t("no")} />
              ),
            value: (l) => String(Boolean(l.equipment?.includes(key))),
          })),
      ],
    },
  ];

  const differs = (row: Row) => new Set(cars.map((l) => String(row.value(l)))).size > 1;
  const visibleSections = sections
    .map((s) => ({ ...s, rows: onlyDiff && cars.length > 1 ? s.rows.filter(differs) : s.rows }))
    .filter((s) => s.rows.length > 0);

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
    <div className="pt-6 pb-16">
      {/* Header */}

      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-gray-500 mt-1">{t("subtitle", { count: cars.length, max: MAX_COMPARE })}</p>
        </div>

        <div className="flex items-center gap-2">
          {cars.length > 1 && (
            <label className="inline-flex items-center gap-1 pr-3 rounded-xl text-sm font-medium cursor-pointer select-none">
              <Switch checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} />
              {t("onlyDiff")}
            </label>
          )}

          <button
            type="button"
            onClick={clearCompare}
            className="h-11 px-4 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            {t("clear")}
          </button>
        </div>
      </div>

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
              <AddSlot favoritesCount={favoritesToAdd.length} onAddFavorites={addFromFavorites} />
            )}
          </div>
        </div>
      </div>

      {/* Таблица */}

      {cars.length === 1 && <p className="sm:hidden mt-3 text-sm text-gray-500">{t("addOneMore")}</p>}

      <div className={cn("overflow-x-auto -mx-4 px-4 scrollbar-thin", sizes)} style={vars} onScroll={syncScroll}>
        <div className={minWidthClass}>
          {visibleSections.map((section) => (
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
                              isBest ? "font-semibold text-emerald-700" : "text-gray-900"
                            )}
                          >
                            {row.display(l)}
                            {isBest && (
                              <span className="hidden sm:inline ml-2 px-1.5 py-0.5 rounded-md bg-emerald-50 text-[11px] font-medium">
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

          {onlyDiff && visibleSections.length === 0 && (
            <p className="py-12 text-center text-gray-500">{t("noDiff")}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Шапка колонок ---------- */

function CarHeader({ listing }: { listing: Listing }) {
  const t = useTranslations("compare");
  const image = listing.images[0];

  return (
    <div className="relative p-2">
      <Link href={`/listing/${listing.id}`} className="group flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
        <span className="relative w-14 sm:w-20 aspect-[4/3] shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {image ? (
            <Image src={image} alt={listing.title} fill sizes="80px" className="object-cover" />
          ) : (
            <DirectionsCarOutlinedIcon sx={{ fontSize: 22 }} className="absolute inset-0 m-auto text-gray-300" />
          )}
        </span>
        <span className="min-w-0 sm:pr-6">
          <span className="block text-sm font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-primary transition">
            {listing.title}
          </span>
          <span className="block text-sm font-semibold mt-0.5">{formatNumber(listing.price)} €</span>
        </span>
      </Link>

      <button
        type="button"
        onClick={() => removeFromCompare(listing.id)}
        aria-label={t("remove")}
        title={t("remove")}
        className="absolute top-1 right-1 w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition cursor-pointer"
      >
        <CloseIcon sx={{ fontSize: 18 }} />
      </button>
    </div>
  );
}

function AddSlot({ favoritesCount, onAddFavorites }: { favoritesCount: number; onAddFavorites: () => void }) {
  const t = useTranslations("compare");

  return (
    <div className="p-2">
      <div className="h-full min-h-16 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 p-2 text-center">
        <Link href="/cars" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-primary transition">
          <AddIcon sx={{ fontSize: 18 }} />
          {t("addCar")}
        </Link>
        {favoritesCount > 0 && (
          <button
            type="button"
            onClick={onAddFavorites}
            className="text-xs text-gray-500 hover:text-black underline underline-offset-2 cursor-pointer"
          >
            {t("fromFavorites", { count: favoritesCount })}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Пустое состояние ---------- */

function EmptyState({ favoritesCount, onAddFavorites }: { favoritesCount: number; onAddFavorites: () => void }) {
  const t = useTranslations("compare");

  return (
    <div className="pt-6 pb-16">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">{t("title")}</h1>

      <div className="text-center py-14 px-6 rounded-3xl bg-gray-50">
        <span className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-white shadow-sm">
          <CompareArrowsIcon sx={{ fontSize: 30 }} className="text-gray-900" />
        </span>
        <h2 className="text-xl font-semibold mt-4">{t("empty.title")}</h2>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">{t("empty.text", { max: MAX_COMPARE })}</p>

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link
            href="/cars"
            className="inline-flex items-center h-12 px-6 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold transition"
          >
            {t("empty.cta")}
          </Link>

          {favoritesCount > 0 && (
            <button
              type="button"
              onClick={onAddFavorites}
              className="inline-flex items-center h-12 px-6 rounded-full border border-gray-300 bg-white font-semibold hover:border-gray-900 transition cursor-pointer"
            >
              {t("fromFavorites", { count: favoritesCount })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
