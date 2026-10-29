import type { MetadataRoute } from "next";

import { brands } from "@/features/brands/data/brands";
import { modelsByBrand } from "@/features/brands/data/models";
import { modelSlug } from "@/features/brands/lib/landing";
import { getPublishedListings } from "@/features/cars/api";
import { getDealers } from "@/features/dealers/api";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Каждая страница — на латышском (без префикса) и на русском (/ru)
const both = (path: string): MetadataRoute.Sitemap[number] => ({
  url: `${SITE}${path}`,
  alternates: { languages: { lv: `${SITE}${path}`, ru: `${SITE}/ru${path === "/" ? "" : path}` } },
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, dealers] = await Promise.all([getPublishedListings(), getDealers()]);

  return [
    ...["/", "/cars", "/dealers", "/sell", "/about", "/rules", "/privacy", "/contacts"].map(both),
    ...brands.map((b) => both(`/cars/${b.slug}`)),
    ...Object.entries(modelsByBrand).flatMap(([brand, models]) => models.map((m) => both(`/cars/${brand}/${modelSlug(m)}`))),
    ...listings.map((l) => both(`/listing/${l.id}`)),
    ...dealers.map((d) => both(`/dealers/${d.slug}`)),
  ];
}
