import type { DamageMap } from "./config/damage";

// Объявление — общий тип для демо-данных, API и компонентов
export type Fuel = "petrol" | "diesel" | "hybrid" | "electric" | "gas";
export type Transmission = "automatic" | "manual";
export type Drive = "fwd" | "rwd" | "awd";
export type SellerType = "private" | "dealer";

// Ключи совпадают с формой продажи; подписи — messages → options
export const OVERALL_CONDITIONS = ["excellent", "good", "average", "repair"] as const;
export type OverallCondition = (typeof OVERALL_CONDITIONS)[number];
export const SERVICE_STATES = ["recent", "partial", "required"] as const;
export type ServiceState = (typeof SERVICE_STATES)[number];
export const MILEAGE_LATVIA = ["none", "upTo10k", "from10to50k", "from50to100k", "over100k"] as const;
export type MileageLatvia = (typeof MILEAGE_LATVIA)[number];

export type Listing = {
  id: string;
  brand: string; // slug марки (features/brands/data/brands.ts)
  model: string; // модель из features/brands/data/models.ts или своя, если её нет в списке
  title: string;
  year: number;
  price: number;
  mileage: number;
  engine: number | null; // л, null для электро
  power: number; // л.с.
  fuel: Fuel;
  transmission: Transmission;
  drive: Drive;
  bodyType: string; // значения как в форме продажи
  condition: "used" | "new";
  sellerType: SellerType;
  sellerName?: string;
  dealer?: string; // slug дилера
  userId?: string; // владелец — зарегистрированный частный продавец (у дилерских — dealer)
  contactId?: string; // контактное лицо дилера (DealerContact.id); нет — основной телефон компании
  city: string; // ключ места из lib/places.ts (город или край)
  postedMinutesAgo: number;
  phone: string;
  images: string[];
  review?: "pending"; // новое объявление на проверке: не видно покупателям, пока модератор не одобрит

  // Детали для страницы объявления (необязательные)
  color?: string; // ключ цвета, как в форме продажи
  owners?: number;
  vin?: string; // полный VIN; на странице скрыт до нажатия «Показать VIN»
  inspectionUntil?: string; // техосмотр, «MM.YYYY»
  noAccidents?: boolean;
  negotiable?: boolean;
  description?: string;
  videoUrl?: string; // ссылка на YouTube от продавца
  equipment?: string[]; // ключи из features/cars/config/equipment.ts
  sellerSince?: number;
  views?: number;
  damages?: DamageMap; // {} — продавец отметил, что повреждений нет

  // Состояние и обслуживание — из раздела «Состояние» формы продажи
  overallCondition?: OverallCondition;
  service?: ServiceState;
  serviceBook?: boolean;
  mileageLatvia?: MileageLatvia; // пробег в Латвии: 0 — только что ввезён
};

// Сколько опубликованных объявлений: всего, по маркам, моделям (byModel[brand][model]) и подборкам.
// Считает сервер (getListingStats), в браузер приходит через CatalogProvider — useListingStats()
export type ListingStats = {
  total: number;
  byBrand: Record<string, number>;
  byModel: Record<string, Record<string, number>>;
  byCollection: Record<string, number>;
};
