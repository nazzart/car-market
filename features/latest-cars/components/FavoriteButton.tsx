"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

// Пока состояние локальное — позже сохраним избранное в профиле пользователя
export default function FavoriteButton({ className }: { className?: string }) {
  const t = useTranslations("common");
  const [active, setActive] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setActive((prev) => !prev)}
      aria-pressed={active}
      aria-label={active ? t("removeFavorite") : t("addFavorite")}
      className={`
        w-9 h-9
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
