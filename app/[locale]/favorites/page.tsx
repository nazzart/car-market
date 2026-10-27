import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import Container from "@/components/layout/Container";
import FavoritesView from "@/features/favorites/components/FavoritesView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "favorites" });

  return { title: t("metaTitle") };
}

export default function FavoritesPage() {
  return (
    <Container>
      {/* Suspense нужен для useSearchParams в подборках пустого состояния */}
      <Suspense>
        <FavoritesView />
      </Suspense>
    </Container>
  );
}
