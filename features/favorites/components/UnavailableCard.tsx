"use client";

import { useTranslations } from "next-intl";

import CarPhoto from "@/components/ui/CarPhoto";

import { RemoveButton, favoriteCardClass } from "./FavoriteCard";

// Объявление из избранного, которое сняли с продажи или удалили
type UnavailableCardProps = { onRemove: () => void };

export default function UnavailableCard({ onRemove }: UnavailableCardProps) {
  const t = useTranslations("favorites");

  return (
    <article className={`${favoriteCardClass} bg-gray-50`}>
      <CarPhoto src={undefined} alt="" sizes="176px" className="w-32 sm:w-44 shrink-0 rounded-xl" />

      <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-500">{t("unavailable.title")}</h3>
          <p className="text-sm text-gray-500 mt-1">{t("unavailable.text")}</p>
        </div>

        <RemoveButton onClick={onRemove} />
      </div>
    </article>
  );
}
