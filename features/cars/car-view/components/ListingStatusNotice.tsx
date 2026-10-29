"use client";

import { useTranslations } from "next-intl";
import BlockIcon from "@mui/icons-material/Block";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { VisibilitySubject, useVisibility } from "@/features/moderation/visibility";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// Плашка над объявлением: продавец скрыл / продал / удалил или модератор заблокировал
export default function ListingStatusNotice({ listing, brand }: { listing: VisibilitySubject; brand: string }) {
  const t = useTranslations("listing.status");
  const { of } = useVisibility();
  const { seller, moderation, pending, accountBlock } = of(listing);

  // решение модератора важнее статуса продавца
  const key = moderation
    ? moderation.status === "removed"
      ? "deleted"
      : "blocked"
    : accountBlock
      ? "blocked"
      : pending
        ? "pending"
        : seller;
  if (key === "active") return null;

  const blocked = key === "blocked";

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-3 mt-4 p-4 rounded-2xl border",
        blocked ? "bg-red-50 border-red-100 text-red-900" : "bg-amber-50 border-amber-100 text-amber-900"
      )}
    >
      {blocked ? <BlockIcon className="shrink-0" /> : <InfoOutlinedIcon className="shrink-0" />}
      <div className="flex-1">
        <div className="font-semibold">{t(`${key}.title`)}</div>
        <div className="text-sm">{t(`${key}.text`)}</div>
      </div>
      <Link
        href={`/cars?brand=${brand}`}
        className="shrink-0 inline-flex items-center justify-center h-10 px-4 rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-900 hover:border-gray-900 transition"
      >
        {t("similar")}
      </Link>
    </div>
  );
}
