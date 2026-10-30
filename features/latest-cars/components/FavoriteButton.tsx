"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import { photoButtonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { isFavorite, toggleFavorite, useIsFavorite } from "@/features/favorites/store";

type FavoriteButtonProps = {
  listing: { id: string; price: number };
  className?: string;
};

export default function FavoriteButton({ listing, className }: FavoriteButtonProps) {
  const t = useTranslations("common");
  const active = useIsFavorite(listing.id);
  // сохранили — «мигаем фарами»: двойная вспышка света вокруг кнопки
  const [flash, setFlash] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        // кнопка лежит поверх ссылки на объявление
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(listing);
        // вспышка — только если правда сохранили (без входа откроется окно входа)
        if (!active && isFavorite(listing.id)) setFlash(true);
      }}
      onAnimationEnd={() => setFlash(false)}
      aria-pressed={active}
      aria-label={active ? t("removeFavorite") : t("addFavorite")}
      className={photoButtonClass(active, cn(flash && "animate-headlight", className))}
    >
      {active ? (
        <FavoriteIcon sx={{ fontSize: 18 }} className="text-primary" />
      ) : (
        <FavoriteBorderIcon sx={{ fontSize: 18 }} />
      )}
    </button>
  );
}
