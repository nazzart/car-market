import type { ListingStatus } from "@/features/account/listings/status";
import type { AccountBlock, Moderation } from "@/features/moderation/types";

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
  brand: string; // slug марки (каталог: car_brands)
  brandName: string; // название марки — из каталога при чтении
  modelId?: number; // модель в каталоге (car_models.id); brand и model — её марка и название
  model: string; // модель из каталога (car_models)
  version?: string; // версия внутри модели: «530d xDrive», «E 220 CDI» (features/cars/lib/version.ts)
  title: string; // марка + модель + версия — listingTitle()
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
  dealerVerified?: boolean; // значок «Проверенный дилер» (модератор сверил компанию с регистром)
  userId?: string; // владелец — зарегистрированный частный продавец, uuid (у дилерских — dealer)
  contactId?: string; // контактное лицо дилера (DealerContact.id); нет — основной телефон компании
  contactPerson?: { name: string; role?: string }; // кто отвечает на звонки (для карточки и страницы объявления)
  city: string; // ключ места из lib/places.ts (город или край)
  postedMinutesAgo: number;
  phone: string;
  images: string[];
  review?: "pending"; // новое объявление на проверке: не видно покупателям, пока модератор не одобрит
  status: ListingStatus; // продавец: активно / скрыто / продано / удалено
  moderation?: Moderation; // решение модератора — важнее статуса продавца
  accountBlock?: AccountBlock; // модератор заблокировал аккаунт продавца
  excludedCollections?: string[]; // модератор убрал из подборок (slug)

  // Детали для страницы объявления (необязательные)
  color?: string; // ключ цвета, как в форме продажи
  owners?: number;
  vin?: string; // полный VIN; на странице скрыт до нажатия «Показать VIN»
  inspectionUntil?: string; // техосмотр, «MM.YYYY»
  noAccidents?: boolean;
  negotiable?: boolean;
  // лизинг (только дилеры): «no 320 €/mēn.» под ценой на карточках
  leasingMonthly?: number;
  leasingDownPayment?: number; // %
  leasingMonths?: number;
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

// Страница объявления: тон строки в сводке состояния и пункт навигации по разделам
export type ConditionTone = "good" | "warn" | "bad" | "neutral";
export type SectionNavItem = { id: string; label: string };

// Версии в списке моделей /cars: группа («530») и сколько опубликованных объявлений; по моделям марки
export type VersionCount = { value: string; count: number };
export type VersionsByModel = Record<string, VersionCount[]>;
// Модель в фильтре /cars и быстром поиске на главной: из каталога, с группами версий из объявлений.
// catalogVersions — точные версии каталога («530d», «530d xDrive»): их предлагает поиск по вводу
export type FilterModel = { name: string; versions: VersionCount[]; catalogVersions: string[] };
