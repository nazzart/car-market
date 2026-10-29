"use client";

import CloseIcon from "@mui/icons-material/Close";
import { useTranslations } from "next-intl";

import CarPhoto from "@/components/ui/CarPhoto";
import type { Listing } from "@/features/cars/types";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";

import { removeFromCompare } from "../store";

// Колонка машины в шапке сравнения: фото, название, цена, «убрать»
export default function CarHeader({ listing }: { listing: Listing }) {
  const t = useTranslations("compare");
  const image = listing.images[0];

  return (
    <div className="relative p-2">
      <Link href={`/listing/${listing.id}`} className="group flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
        <CarPhoto src={image} alt={listing.title} sizes="80px" iconSize={22} className="w-14 sm:w-20 shrink-0 rounded-lg" />
        <span className="min-w-0 sm:pr-6">
          <span className="block text-sm font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-primary transition">
            {listing.title}
          </span>
          <span className="block text-sm font-semibold mt-0.5">{formatPrice(listing.price)}</span>
        </span>
      </Link>

      <button
        type="button"
        onClick={() => removeFromCompare(listing.id)}
        aria-label={t("remove")}
        title={t("remove")}
        className="absolute top-1 right-1 w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition cursor-pointer"
      >
        <CloseIcon sx={{ fontSize: 18 }} />
      </button>
    </div>
  );
}
