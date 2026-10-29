"use client";

import FavoriteIcon from "@mui/icons-material/Favorite";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { useLocale, useTranslations } from "next-intl";

import Badge from "@/components/ui/Badge";
import CarPhoto from "@/components/ui/CarPhoto";
import MetaLine from "@/components/ui/MetaLine";
import ListingPhone from "@/features/cars/car-view/components/ListingPhone";
import { useSpecLine } from "@/features/cars/lib/useSpecLine";
import type { Listing } from "@/features/cars/types";
import CompareButton from "@/features/compare/components/CompareButton";
import { Link } from "@/i18n/navigation";
import { usePlaceName } from "@/lib/places";
import { formatAgo, formatNumber, formatPrice } from "@/lib/utils";

import type { FavoriteEntry } from "../types";

// Общая рамка карточек избранного (и заглушек при загрузке)
export const favoriteCardClass = "relative min-w-0 flex gap-3 sm:gap-4 p-3 rounded-card border border-gray-200 bg-white";

type RemoveButtonProps = { onClick: () => void };

export function RemoveButton({ onClick }: RemoveButtonProps) {
  const t = useTranslations("favorites");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("remove")}
      title={t("remove")}
      className="relative z-10 w-10 h-10 shrink-0 flex items-center justify-center rounded-full hover:bg-gray-100 transition cursor-pointer"
    >
      <FavoriteIcon fontSize="small" className="text-primary" />
    </button>
  );
}

// Объявление в избранном: цена (и насколько подешевело), характеристики, когда добавлено, телефон
type FavoriteCardProps = {
  listing: Listing;
  entry: FavoriteEntry;
  now: number | null;
  onRemove: () => void;
};

export default function FavoriteCard({
  listing,
  entry,
  now,
  onRemove,
}: FavoriteCardProps) {
  const t = useTranslations("favorites");
  const specLine = useSpecLine();
  const placeName = usePlaceName();
  const locale = useLocale();

  const image = listing.images[0];
  const href = `/listing/${listing.id}`;
  const diff = listing.price - entry.price; // < 0 — подешевело с момента добавления
  const added = now === null ? null : Math.round((now - entry.addedAt) / 60_000); // минут назад

  return (
    <article className={`group ${favoriteCardClass} hover:border-gray-300 hover:shadow-lg hover:shadow-black/5 transition`}>
      <CarPhoto src={image} alt={listing.title} sizes="176px" className="w-32 sm:w-44 shrink-0 rounded-xl" />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {/* ссылка растянута на всю карточку через after: */}
            <Link href={href} className="after:absolute after:inset-0 after:rounded-card">
              <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary transition">
                {listing.title}
              </h3>
            </Link>

            <div className="flex flex-wrap items-baseline gap-x-2 mt-0.5">
              <span className="text-lg font-semibold">{formatPrice(listing.price)}</span>
              {diff < 0 && (
                <span className="text-sm text-gray-400 line-through">{formatPrice(entry.price)}</span>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <CompareButton id={listing.id} variant="soft" className="relative z-10" />
            <RemoveButton onClick={onRemove} />
          </div>
        </div>

        {diff < 0 && (
          <Badge tone="success" icon={<TrendingDownIcon sx={{ fontSize: 15 }} />} className="self-start mt-1">
            {t("priceDropped", { amount: formatNumber(-diff) })}
          </Badge>
        )}

        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
          {specLine(listing)}
        </div>

        <div className="mt-auto pt-2 flex flex-wrap items-end justify-between gap-2">
          <MetaLine
            items={[
              placeName(listing.city),
              added !== null && (added < 1 ? t("addedJustNow") : t("added", { ago: formatAgo(added, locale) })),
            ]}
          />

          <div className="hidden sm:block">
            <ListingPhone listing={listing} />
          </div>
        </div>
      </div>
    </article>
  );
}
