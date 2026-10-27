"use client";

import { useTranslations } from "next-intl";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import { toggleFavorite, useIsFavorite } from "@/features/favorites/store";

type Props = {
  listing: { id: string; price: number };
  className?: string;
};

export default function FavoriteButton({ listing, className }: Props) {
  const t = useTranslations("common");
  const active = useIsFavorite(listing.id);

  return (
    <button
      type="button"
      onClick={(e) => {
        // кнопка лежит поверх ссылки на объявление
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(listing);
      }}
      aria-pressed={active}
      aria-label={active ? t("removeFavorite") : t("addFavorite")}
      className={`
        w-10 h-10
        flex items-center justify-center
        rounded-full
        bg-white/90 backdrop-blur
        shadow-sm
        hover:bg-white hover:scale-105
        transition
        cursor-pointer
        ${className ?? ""}
      `}
    >
      {active ? (
        <FavoriteIcon fontSize="small" className="text-primary" />
      ) : (
        <FavoriteBorderIcon fontSize="small" className="text-gray-700" />
      )}
    </button>
  );
}
