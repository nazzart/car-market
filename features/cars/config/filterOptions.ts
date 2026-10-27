import { brands } from "@/features/brands/data/brands";
import { dealers } from "@/features/dealers/data/dealers";
import { formatNumber } from "@/lib/utils";

// Только значения — названия берутся из messages/{locale}/options.json по группе
// (value совпадают со значениями в форме продажи)
export const bodyTypes = ["sedan", "suv", "wagon", "hatchback", "coupe", "convertible", "minivan", "pickup"];
export const fuels = ["petrol", "diesel", "hybrid", "electric", "gas"];
export const transmissions = ["automatic", "manual"];
export const drives = ["fwd", "rwd", "awd"];
export const sellerTypes = ["private", "dealer"];
export const conditions = ["used", "new"];

// "" — сортировка по умолчанию (переводится как options.sort.newest)
export const sortValues = ["", "price_asc", "price_desc", "mileage_asc", "year_desc"];

// Ключи URL, которые считаются фильтрами (sort и view — нет)
export const FILTER_KEYS = [
  "collection",
  "condition",
  "brand",
  "model",
  "priceFrom",
  "priceTo",
  "yearFrom",
  "yearTo",
  "mileageTo",
  "bodyType",
  "fuel",
  "transmission",
  "drive",
  "sellerType",
  "dealer",
] as const;

export type FilterKey = (typeof FILTER_KEYS)[number];

type Translate = (key: string, values?: Record<string, string | number>) => string;

// Текст чипа активного фильтра. tOptions — useTranslations("options"), tChips — useTranslations("cars.chips")
export const chipLabel = (
  key: FilterKey,
  value: string,
  tOptions: Translate,
  tChips: Translate
): string => {
  switch (key) {
    case "collection":
      return tOptions(`collections.${value}.label`);
    case "condition":
      return tOptions(`condition.${value}`);
    case "brand":
      return brands.find((b) => b.slug === value)?.name ?? value;
    case "model":
      return value;
    case "priceFrom":
      return tChips("priceFrom", { value: formatNumber(+value) });
    case "priceTo":
      return tChips("priceTo", { value: formatNumber(+value) });
    case "yearFrom":
      return tChips("yearFrom", { value });
    case "yearTo":
      return tChips("yearTo", { value });
    case "mileageTo":
      return tChips("mileageTo", { value: formatNumber(+value) });
    case "bodyType":
      return tOptions(`bodyType.${value}`);
    case "fuel":
      return tOptions(`fuel.${value}`);
    case "transmission":
      return tOptions(`transmission.${value}`);
    case "drive":
      return tOptions(`driveFull.${value}`);
    case "sellerType":
      return tOptions(`sellerType.${value}`);
    case "dealer":
      return dealers.find((d) => d.slug === value)?.name ?? value;
  }
};
