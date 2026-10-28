import type { DamageMap } from "@/features/cars/config/damage";

import { FieldConfig } from "./utils/sectionUtils";

// Все поля формы продажи. Значения из полей ввода — строки (как ввёл пользователь),
// выбор нескольких вариантов — массивы, повреждения — карта «деталь → виды повреждений»
export type SellFormData = {
  // основное
  brand: string;
  model: string;
  year: string;
  mileage: string;
  price: string;
  negotiable: string;
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
  // контакты
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  sellerCity: string;
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
