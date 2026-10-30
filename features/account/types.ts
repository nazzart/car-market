import type { DealerContact, Dealer, OpeningHours } from "@/features/dealers/types";

import type { SettingsForm } from "./settings/useSettingsForm";

// Вкладки кабинета = статусы объявлений (удалённые не показываем); «pending» и «blocked» — только если есть такие
export const ACCOUNT_TABS = ["active", "pending", "paused", "sold", "blocked"] as const;
export type AccountTab = (typeof ACCOUNT_TABS)[number];

// Форма настроек дилера
export type DealerForm = {
  name: string;
  regNumber: string;
  type: Dealer["type"];
  brands: string[];
  description: string;
  email: string;
  phone: string;
  address: string; // одно поле «улица, город» — как в подсказках геокодера
  lat: number;
  lng: number;
  hours: OpeningHours;
  showContactPerson: boolean;
  contacts: DealerContact[];
  reassign: Record<string, string>; // «контакт → кому передать его объявления» — применяется при сохранении
};

export type DealerFormField = "name" | "regNumber" | "email" | "phone" | "address" | "hours";

export type DealerSettingsForm = SettingsForm<DealerForm, DealerFormField>;
