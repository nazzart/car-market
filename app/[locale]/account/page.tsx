import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import type { LocaleParams } from "@/i18n/types";
import Container from "@/components/layout/Container";
import AccountView from "@/features/account/AccountView";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });

  return { title: t("metaTitle") };
}

export default function AccountPage() {
  return (
    <Container>
      <AccountView />
    </Container>
  );
}
