"use client";

import { useTranslations } from "next-intl";
import VerifiedIcon from "@mui/icons-material/Verified";

import { useDealerVerified } from "@/features/moderation/visibility";
import { cn } from "@/lib/utils";

// Синий значок «Проверенный дилер» — только если модератор сверил компанию с регистром
export default function VerifiedBadge({ slug, size = 16, className }: { slug: string; size?: number; className?: string }) {
  const t = useTranslations("dealers");
  const isVerified = useDealerVerified();

  if (!isVerified(slug)) return null;

  return <VerifiedIcon sx={{ fontSize: size }} className={cn("text-info-accent shrink-0", className)} titleAccess={t("verified")} />;
}
