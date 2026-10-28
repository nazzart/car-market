import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import BrandLanding from "@/features/brands/components/BrandLanding";
import { findBrand, findModel, listingsFor } from "@/features/brands/lib/landing";

type Props = { params: Promise<{ locale: string; brand: string; model: string }> };

// Страница модели (/cars/bmw/m4)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, brand, model } = await params;
  const found = findBrand(brand);
  const modelName = findModel(brand, model);
  if (!found || !modelName) return {};

  const t = await getTranslations({ locale, namespace: "cars.brandPage" });
  const name = `${found.name} ${modelName}`;
  const count = listingsFor(brand, modelName).length;

  return {
    title: t("metaTitle", { name, count }),
    description: t("metaDescription", { name, count }),
  };
}

export default async function ModelPage({ params }: Props) {
  const { brand, model } = await params;
  const modelName = findBrand(brand) && findModel(brand, model);
  if (!modelName) notFound();

  return <BrandLanding brand={brand} model={modelName} />;
}
