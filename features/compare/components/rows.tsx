"use client";

// Строки таблицы сравнения: что показывать, по какому значению сравнивать и где «лучше» — меньше или больше
import CheckIcon from "@mui/icons-material/Check";
import RemoveIcon from "@mui/icons-material/Remove";
import { useTranslations } from "next-intl";

import { equipmentGroups } from "@/features/cars/config/equipment";
import { type Listing, OVERALL_CONDITIONS, SERVICE_STATES } from "@/features/cars/types";
import { usePlaceName } from "@/lib/places";
import { formatNumber, formatPrice } from "@/lib/utils";

import type { CompareRow, CompareSection } from "../types";


// «06.2027» → 202706, чтобы сравнивать даты техосмотра
const monthValue = (date?: string) => {
  if (!date) return undefined;
  const [month, year] = date.split(".");
  return Number(year) * 100 + Number(month);
};

const damagedParts = (l: Listing) => (l.damages ? Object.keys(l.damages).length : undefined);

// лучшее значение в строке; нет лучшего, если все равны или данных мало
export function bestValue(row: CompareRow, cars: Listing[]) {
  if (!row.best || cars.length < 2) return undefined;
  const values = cars.map(row.value).filter((v): v is number => typeof v === "number");
  if (values.length < 2 || new Set(values).size < 2) return undefined;
  return row.best === "min" ? Math.min(...values) : Math.max(...values);
}

export function useCompareSections(cars: Listing[]): CompareSection[] {
  const t = useTranslations("compare");
  const tSpecs = useTranslations("listing.specs");
  const tCommon = useTranslations("common");
  const tOptions = useTranslations("options");
  const placeName = usePlaceName();

  const dash = <span className="text-gray-300">—</span>;
  const yesNo = (v?: boolean) => (v === undefined ? dash : v ? t("yes") : t("no"));

  const sections: CompareSection[] = [
    {
      key: "main",
      title: t("sections.main"),
      rows: [
        { key: "price", label: t("rows.price"), display: (l) => `${formatPrice(l.price)}`, value: (l) => l.price, best: "min" },
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
            l.dealer ? l.sellerName : t("privateSeller"),
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
          .map<CompareRow>((key) => ({
            key: `eq-${key}`,
            label: tOptions(`equipment.${key}`),
            display: (l) =>
              l.equipment?.includes(key) ? (
                <CheckIcon fontSize="small" className="text-success-accent" aria-label={t("yes")} />
              ) : (
                <RemoveIcon fontSize="small" className="text-gray-300" aria-label={t("no")} />
              ),
            value: (l) => String(Boolean(l.equipment?.includes(key))),
          })),
      ],
    },
  ];

  return sections;
}
