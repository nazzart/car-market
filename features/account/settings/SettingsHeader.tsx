"use client";

import { useTranslations } from "next-intl";

import PageHeader from "@/components/ui/PageHeader";

type SettingsHeaderProps = { dealer?: boolean };

export default function SettingsHeader({ dealer }: SettingsHeaderProps) {
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
