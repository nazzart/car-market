import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import Container from "@/components/layout/Container";
import DealersView from "@/features/dealers/components/DealersView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dealers" });

  return { title: t("metaTitle") };
}

export default function DealersPage() {
  return (
    <Container>
      {/* Suspense нужен для useSearchParams в клиентском компоненте */}
      <Suspense>
        <DealersView />
      </Suspense>
    </Container>
  );
}
