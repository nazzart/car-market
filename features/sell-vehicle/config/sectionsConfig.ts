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
    fields: ["brand", "model", "year", "mileage", "price", "bodyType", "color"],
  },
  {
    id: "technical",
    component: TechnicalSection,
    required: true,
    title: "Технические характеристики",
    fields: ["engineCapacity", "power", "transmission", "drive"],
  },
  {
    id: "history",
    component: CarHistorySection,
    required: true,
    title: "История автомобиля",
    fields: ["inspectionUntil"],
  },
  {
    id: "condition",
    component: CarConditionSection,
    required: false,
    title: "Состояние автомобиля",
    fields: ["condition", "hadAccident", "hasServiceDone", "hasServiceBook"],
  },
  {
    id: "equipment",
    component: CarEquipmentSection,
    title: "Комплектация",
    required: false,
    fields: [
      "comfort",
      "safety",
      "multimedia",
      "interior",
      "exterior",
      "wheels",
    ],
  },
  {
    id: "description",
    component: CarDescriptionSection,
    title: "Описание автомобиля",
    required: true,
    fields: ["description"],
  },
  {
    id: "contact",
    component: ContactInfoSection,
    required: true,
    title: "Контактная информация",
    fields: ["sellerName", "sellerPhone", "sellerEmail", "sellerCity"],
  },
  {
    id: "photos",
    component: PhotosSection,
    required: false,
    title: "Фото",
    fields: [],
  },
];
