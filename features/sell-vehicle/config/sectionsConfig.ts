import { CarInfoSection } from "../sections/CarInfoSection";
import { CarConditionSection } from "../sections/CarConditionSection";
import { TechnicalSection } from "../sections/TechicalSection";
import { CarHistorySection } from "../sections/CarHistorySection";
import { CarEquipmentSection } from "../sections/CarEquipmentSection";
import { CarDescriptionSection } from "../sections/CarDescriptionSection";
import { ContactInfoSection } from "../sections/ContactSection";
import { PhotosSection } from "../sections/PhotosSection";

// Названия разделов — messages/{locale}/sell.json → sections.{id}
export const sections = [
  {
    id: "basic-info",
    component: CarInfoSection,
    required: true,
    fields: [
      { name: "brand", rules: ["required"] },
      { name: "model", rules: ["required"] },
      { name: "year", rules: ["required"] },
      { name: "mileage", rules: ["required"] },
      { name: "price", rules: ["required"] },
      { name: "negotiable" },
      { name: "bodyType", rules: ["required"] },
      { name: "color", rules: ["required"] },
    ],
  },
  {
    id: "technical",
    component: TechnicalSection,
    required: true,
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
    fields: [
      { name: "condition" },
      { name: "hadAccident" },
      { name: "hasServiceDone" },
      { name: "hasServiceBook" },
      { name: "damages", defaultValue: {} },
    ],
  },
  {
    id: "equipment",
    component: CarEquipmentSection,
    required: false,
    fields: [
      { name: "comfort", defaultValue: [] },
      { name: "safety", defaultValue: [] },
      { name: "multimedia", defaultValue: [] },
      { name: "interior", defaultValue: [] },
      { name: "exterior", defaultValue: [] },
      { name: "wheels", defaultValue: [] },
    ],
  },
  {
    id: "description",
    component: CarDescriptionSection,
    required: true,
    fields: [{ name: "description", rules: ["required"] }],
  },
  {
    id: "contact",
    component: ContactInfoSection,
    required: true,
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
    fields: [{ name: "photos", defaultValue: [] }],
  },
];
