import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import type { LocaleParams } from "@/i18n/types";
import Container from "@/components/layout/Container";
import { SellVehicleLayout } from "@/features/sell-vehicle/components/SellVehicleLayout";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sell" });

  return { title: t("metaTitle") };
}

export default function SellVehiclePage() {
  return (
    <Container>
      {/* Suspense нужен для useSearchParams в клиентском компоненте */}
      <Suspense>
        <SellVehicleLayout />
      </Suspense>
    </Container>
  );
}
