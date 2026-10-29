"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export default function SettingsHeader({ dealer }: { dealer?: boolean }) {
  const t = useTranslations("account.settings");

  return (
    <div className="mb-8">
      <Link href="/account" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-black transition">
        <ArrowBackIcon sx={{ fontSize: 16 }} />
        {t("back")}
      </Link>

      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-3">{dealer ? t("titleDealer") : t("title")}</h1>
      <p className="text-gray-500 mt-1">{dealer ? t("subtitleDealer") : t("subtitle")}</p>
    </div>
  );
}
