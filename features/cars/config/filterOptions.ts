import { brands } from "@/features/brands/data/brands";
import { collections } from "@/features/collections/data/collections";
import { formatNumber } from "@/lib/utils";

type Option = { label: string; value: string };

// value совпадают со значениями в форме продажи
export const bodyTypeOptions: Option[] = [
  { label: "Седан", value: "sedan" },
  { label: "Внедорожник", value: "suv" },
  { label: "Универсал", value: "wagon" },
  { label: "Хэтчбек", value: "hatchback" },
  { label: "Купе", value: "coupe" },
  { label: "Кабриолет", value: "convertible" },
  { label: "Минивэн", value: "minivan" },
  { label: "Пикап", value: "pickup" },
];

export const fuelOptions: Option[] = [
  { label: "Бензин", value: "petrol" },
  { label: "Дизель", value: "diesel" },
  { label: "Гибрид", value: "hybrid" },
  { label: "Электро", value: "electric" },
  { label: "Газ", value: "gas" },
];

export const transmissionOptions: Option[] = [
  { label: "Автомат", value: "automatic" },
  { label: "Механика", value: "manual" },
];

export const driveOptions: Option[] = [
  { label: "Передний", value: "fwd" },
  { label: "Задний", value: "rwd" },
  { label: "Полный", value: "awd" },
];

export const sellerOptions: Option[] = [
  { label: "Частные", value: "private" },
  { label: "Дилеры", value: "dealer" },
];

export const conditionOptions: Option[] = [
  { label: "С пробегом", value: "used" },
  { label: "Новые", value: "new" },
];

export const sortOptions: Option[] = [
  { label: "Сначала новые объявления", value: "" },
  { label: "Сначала дешевле", value: "price_asc" },
  { label: "Сначала дороже", value: "price_desc" },
  { label: "С меньшим пробегом", value: "mileage_asc" },
  { label: "Сначала новее год", value: "year_desc" },
];

export const labelOf = (options: Option[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value;

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
] as const;

export type FilterKey = (typeof FILTER_KEYS)[number];

// Текст чипа активного фильтра
export const chipLabel = (key: FilterKey, value: string): string => {
  switch (key) {
    case "collection":
      return collections.find((c) => c.slug === value)?.label ?? value;
    case "condition":
      return labelOf(conditionOptions, value);
    case "brand":
      return brands.find((b) => b.slug === value)?.name ?? value;
    case "model":
      return value;
    case "priceFrom":
      return `от ${formatNumber(+value)} €`;
    case "priceTo":
      return `до ${formatNumber(+value)} €`;
    case "yearFrom":
      return `от ${value} г.`;
    case "yearTo":
      return `до ${value} г.`;
    case "mileageTo":
      return `пробег до ${formatNumber(+value)} км`;
    case "bodyType":
      return labelOf(bodyTypeOptions, value);
    case "fuel":
      return labelOf(fuelOptions, value);
    case "transmission":
      return labelOf(transmissionOptions, value);
    case "drive":
      return `${labelOf(driveOptions, value)} привод`;
    case "sellerType":
      return labelOf(sellerOptions, value);
  }
};
