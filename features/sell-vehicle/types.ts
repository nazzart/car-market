import type { DamageMap } from "@/features/cars/config/damage";

import { FieldConfig } from "./utils/sectionUtils";

// Все поля формы продажи. Значения из полей ввода — строки (как ввёл пользователь),
// выбор нескольких вариантов — массивы, повреждения — карта «деталь → виды повреждений»
export type SellFormData = {
  // основное
  brand: string;
  model: string;
  version: string; // необязательно: «530d xDrive» — попадает в заголовок
  year: string;
  mileage: string;
  price: string;
  negotiable: string;
  leasingMonthly: string; // € в месяц; пусто — без лизинга (только дилеры)
  leasingDownPayment: string; // %
  leasingMonths: string;
  bodyType: string;
  color: string;
  // техника
  fuel: string;
  engineCapacity: string;
  power: string;
  transmission: string;
  drive: string;
  // история
  vin: string;
  owners: string;
  mileageLatvia: string;
  inspectionUntil: string;
  // состояние
  condition: string;
  hadAccident: string;
  hasServiceDone: string;
  hasServiceBook: string;
  damages: DamageMap;
  // комплектация
  comfort: string[];
  safety: string[];
  multimedia: string[];
  interior: string[];
  exterior: string[];
  wheels: string[];
  // описание
  description: string;
  videoUrl: string;
  // контакты (из аккаунта; телефон и место авто можно изменить для объявления)
  account: string; // id вошедшего пользователя
  sellerPhone: string;
  sellerCity: string; // ключ города (или латышское название для дилера вне списка)
  contactId: string; // дилер: контактное лицо, "" — телефон компании
  // фото (адреса превью)
  photos: string[];
};

export type SellField = keyof SellFormData;

// Значение любого поля; null — вариант снят (ChipSelect)
export type SellFieldValue = SellFormData[SellField] | null;

export type UpdateField = (field: SellField, value: SellFieldValue) => void;

export type FormStepProps = {
  id: string;
  title: string;
  data: SellFormData;
  required: boolean;
  fields: FieldConfig[];
  onNext?: () => void;
  updateField: UpdateField;
};


// Публикация по шагам: фото → хранилище, затем объявление → база. error — ключ sell.publish.errors
export type SubmitState =
  | { step: "idle" }
  | { step: "uploading"; done: number; total: number }
  | { step: "saving" }
  | { step: "error"; error: string };
