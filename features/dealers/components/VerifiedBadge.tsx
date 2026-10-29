"use client";

import { useTranslations } from "next-intl";
import VerifiedIcon from "@mui/icons-material/Verified";

import { cn } from "@/lib/utils";

type VerifiedBadgeProps = { verified: boolean | undefined; size?: number; className?: string };

// Синий значок «Проверенный дилер» — только если модератор сверил компанию с регистром.
// verified приходит с данными страницы (дилер или объявление), отдельно его не загружаем
export default function VerifiedBadge({ verified, size = 16, className }: VerifiedBadgeProps) {
  const t = useTranslations("dealers");
  if (!verified) return null;
  return <VerifiedIcon sx={{ fontSize: size }} className={cn("text-info-accent shrink-0", className)} titleAccess={t("verified")} />;
}
