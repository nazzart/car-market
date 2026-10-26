import { CarInfoSection } from "../sections/CarInfoSection";
import { CarConditionSection } from "../sections/CarConditionSection";
import { TechnicalSection } from "../sections/TechicalSection";
import { CarHistorySection } from "../sections/CarHistorySection";
import { CarEquipmentSection } from "../sections/CarEquipmentSection";
import { CarDescriptionSection } from "../sections/CarDescriptionSection";
import { ContactInfoSection } from "../sections/ContactSection";
import { PhotosSection } from "../sections/PhotosSection";

export const sections = [
  {
    id: "basic-info",
    component: CarInfoSection,
    required: true,
    title: "Основная информация",
    fields: [
      { name: "brand", rules: ["required"] },
      { name: "model", rules: ["required"] },
      { name: "year", rules: ["required"] },
      { name: "mileage", rules: ["required"] },
      { name: "price", rules: ["required"] },
      { name: "bodyType", rules: ["required"] },
      { name: "color", rules: ["required"] },
    ],
  },
  {
    id: "technical",
    component: TechnicalSection,
    required: true,
    title: "Технические характеристики",
    fields: [
      { name: "fuel", rules: ["required"] },
      { name: "engineCapacity", rules: ["required", "isEngineCapacity"] },
      { name: "power", rules: ["required"] },
      { name: "transmission", rules: ["required"] },
      { name: "drive", rules: ["required"] },
    ],
  },
  {
    id: "history",
    component: CarHistorySection,
    required: true,
    title: "История автомобиля",
    fields: [
      { name: "vin" },
      { name: "owners" },
      { name: "mileageLatvia" },
      { name: "inspectionUntil", rules: ["required"] },
    ],
  },
  {
    id: "condition",
    component: CarConditionSection,
    required: false,
    title: "Состояние автомобиля",
    fields: [
      { name: "condition" },
      { name: "hadAccident" },
      { name: "hasServiceDone" },
      { name: "hasServiceBook" },
    ],
  },
  {
    id: "equipment",
    component: CarEquipmentSection,
    required: false,
    title: "Комплектация",
    fields: [
      { name: "comfort" },
      { name: "safety" },
      { name: "multimedia" },
      { name: "interior" },
      { name: "exterior" },
      { name: "wheels" },
    ],
  },
  {
    id: "description",
    component: CarDescriptionSection,
    required: true,
    title: "Описание автомобиля",
    fields: [{ name: "description", rules: ["required"] }],
  },
  {
    id: "contact",
    component: ContactInfoSection,
    required: true,
    title: "Контактная информация",
    fields: [
      { name: "sellerName", rules: ["required"] },
      { name: "sellerPhone", rules: ["required", "phone"] },
      { name: "sellerEmail", rules: ["required", "email"] },
      { name: "sellerCity", rules: ["required"] },
    ],
  },
  {
    id: "photos",
    component: PhotosSection,
    required: false,
    title: "Фото",
    fields: [],
  },
];
