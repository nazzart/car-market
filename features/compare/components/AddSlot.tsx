"use client";

import AddIcon from "@mui/icons-material/Add";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

type AddSlotProps = { favoritesCount: number; onAddFavorites: () => void };

// Свободная колонка в шапке сравнения: добавить машину из поиска или избранного
export default function AddSlot({ favoritesCount, onAddFavorites }: AddSlotProps) {
  const t = useTranslations("compare");

  return (
    <div className="p-2">
      <div className="h-full min-h-16 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 p-2 text-center">
        <Link href="/cars" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-primary transition">
          <AddIcon sx={{ fontSize: 18 }} />
          {t("addCar")}
        </Link>
        {favoritesCount > 0 && (
          <button
            type="button"
            onClick={onAddFavorites}
            className="text-xs text-gray-500 hover:text-black underline underline-offset-2 cursor-pointer"
          >
            {t("fromFavorites", { count: favoritesCount })}
          </button>
        )}
      </div>
    </div>
  );
}
