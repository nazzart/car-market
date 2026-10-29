"use client";

import { useTranslations } from "next-intl";

import PageHeader from "@/components/ui/PageHeader";

export default function SettingsHeader({ dealer }: { dealer?: boolean }) {
  const t = useTranslations("account.settings");

  return (
    <PageHeader
      back={{ href: "/account", label: t("back") }}
      title={dealer ? t("titleDealer") : t("title")}
      subtitle={dealer ? t("subtitleDealer") : t("subtitle")}
      className="mb-8"
    />
  );
}
