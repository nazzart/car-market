"use client";

import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import { MAX_COMPARE } from "../store";

// Сравнение пусто: как добавить машины
export default function CompareEmpty({ favoritesCount, onAddFavorites }: { favoritesCount: number; onAddFavorites: () => void }) {
  const t = useTranslations("compare");

  return (
    <div className="pt-6 pb-16">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">{t("title")}</h1>

      <EmptyState variant="hero" icon={CompareArrowsIcon} title={t("empty.title")} text={t("empty.text", { max: MAX_COMPARE })}>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Button size="lg" href="/cars">
            {t("empty.cta")}
          </Button>

          {favoritesCount > 0 && (
            <Button variant="outline" size="lg" onClick={onAddFavorites}>
              {t("fromFavorites", { count: favoritesCount })}
            </Button>
          )}
        </div>
      </EmptyState>
    </div>
  );
}
