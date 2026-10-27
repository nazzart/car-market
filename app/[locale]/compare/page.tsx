import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import Container from "@/components/layout/Container";
import CompareView from "@/features/compare/components/CompareView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "compare" });

  return { title: t("metaTitle") };
}

export default function ComparePage() {
  return (
    <Container>
      <CompareView />
    </Container>
  );
}
