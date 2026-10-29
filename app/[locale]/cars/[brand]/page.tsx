import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import BrandLanding from "@/features/brands/components/BrandLanding";
import { findBrand, listingsFor } from "@/features/brands/lib/landing";

type Props = { params: Promise<{ locale: string; brand: string }> };

// Страница марки (/cars/bmw) — для поиска Google и навигации; фильтры — на /cars?brand=bmw
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, brand } = await params;
  const found = findBrand(brand);
  if (!found) return {};

  const t = await getTranslations({ locale, namespace: "cars.brandPage" });
  const count = (await listingsFor(brand)).length;

  return {
    title: t("metaTitle", { name: found.name, count }),
    description: t("metaDescription", { name: found.name, count }),
  };
}

export default async function BrandPage({ params }: Props) {
  const { brand } = await params;
  if (!findBrand(brand)) notFound();

  return <BrandLanding brand={brand} />;
}
