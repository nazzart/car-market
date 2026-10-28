import type { MetadataRoute } from "next";

import { brands } from "@/features/brands/data/brands";
import { modelsByBrand } from "@/features/brands/data/models";
import { modelSlug } from "@/features/brands/lib/landing";
import { publishedListings } from "@/features/cars/data/listings";
import { dealers } from "@/features/dealers/data/dealers";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Каждая страница — на латышском (без префикса) и на русском (/ru)
const both = (path: string): MetadataRoute.Sitemap[number] => ({
  url: `${SITE}${path}`,
  alternates: { languages: { lv: `${SITE}${path}`, ru: `${SITE}/ru${path === "/" ? "" : path}` } },
});

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...["/", "/cars", "/dealers", "/sell", "/about", "/rules", "/privacy", "/contacts"].map(both),
    ...brands.map((b) => both(`/cars/${b.slug}`)),
    ...Object.entries(modelsByBrand).flatMap(([brand, models]) => models.map((m) => both(`/cars/${brand}/${modelSlug(m)}`))),
    ...publishedListings.map((l) => both(`/listing/${l.id}`)),
    ...dealers.map((d) => both(`/dealers/${d.slug}`)),
  ];
}
