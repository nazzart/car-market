import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import Container from "@/components/layout/Container";
import DealersView from "@/features/dealers/components/DealersView";
import { DEALERS_PAGE_SIZE, countDealers, getDealerFilterOptions, searchDealers } from "@/features/dealers/api";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dealers" });

  return { title: t("metaTitle") };
}

// Фильтры в URL (?city=riga&type=official&page=2): сервер фильтрует и отдаёт одну страницу карточек
// и лёгкие метки для карты, Google видит список дилеров
export default async function DealersPage({ searchParams }: Props) {
  const query = await searchParams;
  const get = (key: string) => {
    const value = query[key];
    return typeof value === "string" && value ? value : null;
  };

  const [result, options, total] = await Promise.all([
    searchDealers({ get }),
    getDealerFilterOptions(),
    countDealers(),
  ]);

  return (
    <Container>
      {/* Suspense нужен для useSearchParams в клиентском компоненте */}
      <Suspense>
        <DealersView result={result} options={options} totalDealers={total} pageSize={DEALERS_PAGE_SIZE} />
      </Suspense>
    </Container>
  );
}
