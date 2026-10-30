import { brands } from "@/features/brands/data/brands";
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
  "version", // группы версий через запятую: «530d,530e» (features/cars/lib/version.ts)
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
  "color",
  "posted",
  "withPhotos",
  "noAccidents",
  "oneOwner",
  "serviceBook",
  "place",
  "area", // окрестности места; отдельным чипом не показываем — входит в чип места
  "powerFrom",
  "powerTo",
  "recentService",
  "goodCondition",
  "inspectionValid",
  "latvia",
] as const;

// Пробег в Латвии: «только что ввезён» / «уже ездил в Латвии»
export const latviaOptions = ["imported", "local"];

// Фильтры, спрятанные в «Дополнительные» (раскрываются сами, если какой-то выбран)
export const advancedKeys = ["powerFrom", "powerTo", "drive", "color", "sellerType", "posted", "withPhotos"];

// «Место + окрестности», км: Rīga + 20 → Jūrmala, Mārupe, Ķekava…; + 50 → Jelgava, Ogre, Sigulda…
export const areaOptions = ["20", "50"];

// «Размещено за…»: значение в URL → минуты
export const postedPeriods = { "1d": 24 * 60, "3d": 3 * 24 * 60, "7d": 7 * 24 * 60 } as const;

// Флажки «да/нет» (в URL значение "1")
export const flagFilters = ["noAccidents", "oneOwner", "serviceBook", "recentService", "goodCondition", "inspectionValid"] as const;

export type FilterKey = (typeof FILTER_KEYS)[number];

type Translate = (key: string, values?: Record<string, string | number>) => string;

// Текст чипа активного фильтра. tOptions — useTranslations("options"), tChips — useTranslations("cars.chips")
export const chipLabel = (
  key: FilterKey,
  value: string,
  tOptions: Translate,
  tChips: Translate,
  names: { dealer: (slug: string) => string | undefined; place: (key: string) => string },
  area?: string | null // для чипа места: «Rīga + 20 km»
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
    case "version":
      return value.split(",").join(", ");
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
      return names.dealer(value) ?? value;
    case "color":
      return tOptions(`colors.${value}`);
    case "posted":
      return tChips(`posted.${value}`);
    case "place":
      return area ? tChips("placeArea", { place: names.place(value), km: area }) : names.place(value);
    case "area":
      return tChips("area", { km: value });
    case "powerFrom":
      return tChips("powerFrom", { value });
    case "powerTo":
      return tChips("powerTo", { value });
    case "latvia":
      return tChips(`latvia.${value}`);
    case "withPhotos":
    case "noAccidents":
    case "oneOwner":
    case "serviceBook":
    case "recentService":
    case "goodCondition":
    case "inspectionValid":
      return tChips(key);
  }
};
