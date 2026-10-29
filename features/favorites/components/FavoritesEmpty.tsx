"use client";

import FavoriteIcon from "@mui/icons-material/Favorite";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useLatestListings } from "@/features/cars/hooks";
import CollectionPills from "@/features/collections/components/CollectionPills";
import CarCard from "@/features/latest-cars/components/CarCard";

// Избранное пусто: как начать и свежие объявления для примера
export default function FavoritesEmpty() {
  const t = useTranslations("favorites");
  const suggested = useLatestListings(4) ?? [];

  return (
    <div>
      <EmptyState
        variant="hero"
        icon={FavoriteIcon}
        iconClassName="text-primary"
        title={t("empty.title")}
        text={t("empty.text")}
      >
        <Button size="lg" href="/cars" className="mt-6">
          {t("empty.cta")}
        </Button>

        {/* min-w-0: строка подборок листается вбок, а не растягивает страницу */}
        <div className="mt-8 min-w-0 text-left sm:[&>div]:justify-center">
          <CollectionPills />
        </div>
      </EmptyState>

      <h2 className="text-xl font-semibold tracking-tight mt-12 mb-5">{t("empty.suggested")}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8">
        {suggested.map((listing) => (
          <CarCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
