import type { AccountBlock } from "@/features/moderation/types";

// Дилер и связанные типы — общие для демо-данных, API и компонентов

// Часы работы по дням; нет дня — выходной. Время в формате «HH:MM»
export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Day = (typeof DAYS)[number];
export type DayHours = { open: string; close: string };
export type OpeningHours = Partial<Record<Day, DayHours>>;

// Контактное лицо дилера (менеджер), которого можно указать у конкретного объявления
export type DealerContact = {
  id: string;
  name: string;
  phone: string;
  role?: string; // «Pārdošanas konsultants» — как указал дилер
};

export type Dealer = {
  slug: string;
  name: string;
  type: "official" | "used"; // официальный дилер / автосалон с пробегом
  brands: string[]; // slug марок, для официальных дилеров
  city: string; // ключ места из lib/places.ts (город или край)
  address: string; // официальный адрес на латышском — не переводится
  lat: number;
  lng: number;
  phone: string; // основной телефон компании — контакт по умолчанию
  contacts?: DealerContact[];
  regNumber?: string; // регистрационный номер (11 цифр)
  verified?: boolean; // модератор сверил компанию с регистром предприятий → значок «Проверенный дилер»
  hours: OpeningHours;
  // Рейтинга пока нет — появится вместе с отзывами
  rating?: number;
  reviews?: number;
  carsInStock: number;
  since: number; // на сайте с
  description?: string;
  showContactPerson?: boolean; // false — имя и должность контактного лица в объявлениях скрыты
  blocked?: AccountBlock; // модератор заблокировал компанию: страница и объявления скрыты
};

// Метка на карте дилеров: только то, что нужно для значка и всплывающей карточки
export type DealerPin = Pick<Dealer, "slug" | "name" | "lat" | "lng" | "address" | "city" | "hours" | "carsInStock">;

// Видимая область карты дилеров (поиск при перемещении карты)
export type MapBounds = { north: number; south: number; east: number; west: number };
