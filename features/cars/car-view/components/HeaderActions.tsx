"use client";

import { useTranslations } from "next-intl";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import CompareButton from "@/features/compare/components/CompareButton";
import { toggleFavorite, useIsFavorite } from "@/features/favorites/store";
import { formatPrice } from "@/lib/utils";

import ShareMenu from "./ShareMenu";

const buttonClass = `
  inline-flex items-center gap-2
  h-10 px-4
  rounded-full
  text-sm font-medium text-gray-900
  hover:bg-gray-100
  transition
  cursor-pointer
`;

// «Сохранить» и «Поделиться» в шапке объявления
type HeaderActionsProps = {
  listing: { id: string; title: string; price: number };
};

export default function HeaderActions({ listing }: HeaderActionsProps) {
  const { title } = listing;
  const t = useTranslations("listing.actions");
  const saved = useIsFavorite(listing.id);
  return (
    <div className="flex items-center -mx-4 sm:mx-0">
      <CompareButton id={listing.id} variant="text" />

      <ShareMenu title={`${title}, ${formatPrice(listing.price)}`} className={buttonClass} />

      <button
        type="button"
        onClick={() => toggleFavorite(listing)}
        aria-pressed={saved}
        className={buttonClass}
      >
        {saved ? (
          <FavoriteIcon fontSize="small" className="text-primary" />
        ) : (
          <FavoriteBorderIcon fontSize="small" />
        )}
        {saved ? t("saved") : t("save")}
      </button>
    </div>
  );
}
