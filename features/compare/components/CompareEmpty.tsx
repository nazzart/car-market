"use client";

import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { useTranslations } from "next-intl";

import EmptyState from "@/components/ui/EmptyState";
import { Link } from "@/i18n/navigation";

import { MAX_COMPARE } from "../store";

// Сравнение пусто: как добавить машины
export default function CompareEmpty({ favoritesCount, onAddFavorites }: { favoritesCount: number; onAddFavorites: () => void }) {
  const t = useTranslations("compare");

  return (
    <div className="pt-6 pb-16">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">{t("title")}</h1>

      <EmptyState variant="hero" icon={CompareArrowsIcon} title={t("empty.title")} text={t("empty.text", { max: MAX_COMPARE })}>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link
            href="/cars"
            className="inline-flex items-center h-12 px-6 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold transition"
          >
            {t("empty.cta")}
          </Link>

          {favoritesCount > 0 && (
            <button
              type="button"
              onClick={onAddFavorites}
              className="inline-flex items-center h-12 px-6 rounded-full border border-gray-300 bg-white font-semibold hover:border-gray-900 transition cursor-pointer"
            >
              {t("fromFavorites", { count: favoritesCount })}
            </button>
          )}
        </div>
      </EmptyState>
    </div>
  );
}
