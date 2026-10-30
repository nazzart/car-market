"use client";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useLocale, useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { BadgeTone } from "@/components/ui/types";
import CarPhoto from "@/components/ui/CarPhoto";
import type { Listing } from "@/features/cars/types";
import type { Moderation } from "@/features/moderation/types";
import { formatAgo, formatNumber, formatPrice } from "@/lib/utils";

import ListingActions from "./ListingActions";
import type { ListingStatus } from "./status";

// Открытия телефона — настоящие (features/cars/api/views.ts); сохранения пока примерно — от просмотров
export const phoneShows = (l: Listing) => l.phoneViews ?? 0;
export const favoritesOf = (l: Listing) => Math.round((l.views ?? 0) * 0.05);

const statusBadge: Record<string, BadgeTone> = {
  active: "success",
  pending: "warning",
  paused: "muted",
  sold: "info",
  blocked: "danger",
};

type AccountListingRowProps = {
  listing: Listing;
  status: ListingStatus;
  moderation?: Moderation;
  pending?: boolean;
  onStatusChange: (status: ListingStatus) => void;
};

// Объявление в кабинете: статус, цена, статистика и действия продавца
export default function AccountListingRow({
  listing,
  status,
  moderation,
  pending,
  onStatusChange,
}: AccountListingRowProps) {
  const t = useTranslations("account.row");
  const tReasons = useTranslations("moderation.reasons");
  const locale = useLocale();
  const badge = moderation ? "blocked" : pending ? "pending" : status;

  return (
    <div className={`flex gap-4 p-3 rounded-card border border-gray-200 ${status === "active" ? "" : "bg-gray-50/60"}`}>
      <CarPhoto
        src={listing.images[0]}
        alt={listing.title}
        sizes="144px"
        iconSize={24}
        className="w-28 sm:w-36 shrink-0 rounded-xl"
        imageClassName={status === "active" ? "" : "grayscale opacity-70"}
      />

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge tone={statusBadge[badge]}>{t(`status.${badge}`)}</Badge>
            <span className="text-xs text-gray-500">{formatAgo(listing.postedMinutesAgo, locale)}</span>
          </div>

          <div className="font-semibold text-gray-900 truncate mt-1">
            {listing.title}, {listing.year}
          </div>
          <div className="font-bold text-gray-900">{formatPrice(listing.price)}</div>

          {/* продавцу — причина блокировки */}
          {moderation && (
            <p className="mt-1.5 text-xs text-danger">
              {t("blockedReason", { reason: tReasons(moderation.reason) })}
              {moderation.note && ` — ${moderation.note}`}
            </p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <VisibilityOutlinedIcon sx={{ fontSize: 14 }} />
              {formatNumber(listing.views ?? 0)}
            </span>
            <span className="inline-flex items-center gap-1">
              <PhoneOutlinedIcon sx={{ fontSize: 14 }} />
              {formatNumber(phoneShows(listing))}
            </span>
            <span className="inline-flex items-center gap-1">
              <FavoriteBorderIcon sx={{ fontSize: 14 }} />
              {formatNumber(favoritesOf(listing))}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button variant="outline" size="sm" href={`/listing/${listing.id}`}>
            {t("open")}
          </Button>
          {/* заблокированное модератором продавец не может снова активировать */}
          {!moderation && !pending && <ListingActions title={listing.title} status={status} onChange={onStatusChange} />}
        </div>
      </div>
    </div>
  );
}
