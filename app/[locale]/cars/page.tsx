import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import Container from "@/components/layout/Container";
import { brands } from "@/features/brands/data/brands";
import CarsSearchView from "@/features/cars/car-list/components/CarsSearchView";
import { countListings } from "@/features/cars/api";
import { collections } from "@/features/collections/config";
import { getDealer } from "@/features/dealers/api";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Заголовок вкладки повторяет заголовок поиска: «BMW M4 — 3 sludinājumi | bestauto.lv»
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const query = await searchParams;
  const get = (key: string) => {
    const value = query[key];
    return typeof value === "string" && value ? value : null;
  };

  const t = await getTranslations({ locale, namespace: "cars" });
  const tOptions = await getTranslations({ locale, namespace: "options" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const brandName = brands.find((b) => b.slug === get("brand"))?.name;
  const collection = collections.find((c) => c.slug === get("collection"));
  const dealerSlug = get("dealer");
  const dealerName = dealerSlug ? (await getDealer(dealerSlug))?.name : undefined;

  const title = dealerName
    ? t("dealerCars", { dealer: dealerName })
    : brandName
      ? [brandName, get("model")].filter(Boolean).join(" ")
      : collection
        ? tOptions(`collections.${collection.slug}.label`)
        : t("title");

  const count = await countListings({ get });

  return {
    title: t("metaTitle", { title, results: tCommon("listings", { count }) }),
    description: t("metaDescription", { title }),
  };
}

export default function CarsPage() {
  return (
    <Container>
      {/* Suspense нужен для useSearchParams в клиентском компоненте */}
      <Suspense>
        <CarsSearchView />
      </Suspense>
    </Container>
  );
}
