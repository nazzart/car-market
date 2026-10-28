"use client";

import { useTranslations } from "next-intl";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { statusOf, useListingStatuses } from "@/features/account/listings/statusStore";
import { Link } from "@/i18n/navigation";

// Плашка над объявлением, если продавец его скрыл, продал или удалил
export default function ListingStatusNotice({ id, brand }: { id: string; brand: string }) {
  const t = useTranslations("listing.status");
  const status = statusOf(useListingStatuses(), id);

  if (status === "active") return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900">
      <InfoOutlinedIcon className="shrink-0" />
      <div className="flex-1">
        <div className="font-semibold">{t(`${status}.title`)}</div>
        <div className="text-sm">{t(`${status}.text`)}</div>
      </div>
      <Link
        href={`/cars?brand=${brand}`}
        className="shrink-0 inline-flex items-center justify-center h-10 px-4 rounded-full bg-white border border-amber-200 text-sm font-semibold text-gray-900 hover:border-gray-900 transition"
      >
        {t("similar")}
      </Link>
    </div>
  );
}
