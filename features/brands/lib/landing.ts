import { getPublishedListings } from "@/features/cars/api";

import { brands } from "../data/brands";
import { modelsByBrand } from "../data/models";

// «3 Series» → «3-series», «ID.4» → «id-4»
export const modelSlug = (model: string) =>
  model
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const findBrand = (slug: string) => brands.find((b) => b.slug === slug);

export const findModel = (brand: string, slug: string) =>
  (modelsByBrand[brand] ?? []).find((m) => modelSlug(m) === slug);

// Те же правила, что и в поиске: модель ищется в названии объявления
export const listingsFor = async (brand: string, model?: string) =>
  (await getPublishedListings()).filter((l) => l.brand === brand && (!model || l.title.toLowerCase().includes(model.toLowerCase())));
