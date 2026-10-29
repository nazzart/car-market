import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import type { PageSearchParams } from "@/i18n/types";
import Container from "@/components/layout/Container";
import { brands } from "@/features/brands/data/brands";
import CarsSearchView from "@/features/cars/car-list/components/CarsSearchView";
import { PAGE_SIZE, type Params, countListings, getLatestListings, relaxSuggestions, searchListings } from "@/features/cars/api";
import { collections } from "@/features/collections/config";
import { getDealer } from "@/features/dealers/api";

type CarsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: PageSearchParams;
};

// Фильтры — в URL (?brand=bmw&priceTo=30000&page=2): страница рендерится на сервере, Google видит результаты
const toParams = async (searchParams: PageSearchParams): Promise<Params> => {
  const query = await searchParams;
  return {
    get: (key) => {
      const value = query[key];
      return typeof value === "string" && value ? value : null;
    },
  };
};

// Заголовок вкладки повторяет заголовок поиска: «BMW M4 — 3 sludinājumi | bestauto.lv»
export async function generateMetadata({ params, searchParams }: CarsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { get } = await toParams(searchParams);

  const t = await getTranslations({ locale, namespace: "cars" });
  const tOptions = await getTranslations({ locale, namespace: "options" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tPages = await getTranslations({ locale, namespace: "common.pagination" });

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
  const page = Number(get("page")) > 1 ? ` · ${tPages("page", { page: Number(get("page")) })}` : "";

  return {
    title: t("metaTitle", { title: `${title}${page}`, results: tCommon("listings", { count }) }),
    description: t("metaDescription", { title }),
  };
}

export default async function CarsPage({ searchParams }: CarsPageProps) {
  const params = await toParams(searchParams);
  const result = await searchListings(params);

  // ничего не нашлось — подсказки, какой фильтр убрать, и свежие объявления
  const empty =
    result.total === 0
      ? { suggestions: await relaxSuggestions(params), fresh: await getLatestListings(3, { withPhotos: true }) }
      : undefined;

  return (
    <Container>
      {/* Suspense нужен для useSearchParams в клиентском компоненте */}
      <Suspense>
        <CarsSearchView result={result} pageSize={PAGE_SIZE} empty={empty} />
      </Suspense>
    </Container>
  );
}
