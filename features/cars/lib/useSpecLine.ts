import { useTranslations } from "next-intl";

import { formatNumber } from "@/lib/utils";

import type { Listing } from "../types";

// Короткая строка характеристик для карточек (и в серверных, и в клиентских компонентах): «2019 · 120 000 km · Dīzelis · Automāts»
export function useSpecLine(): (listing: Listing) => string {
  const t = useTranslations("common");
  const tOptions = useTranslations("options");
  return (listing) =>
    [
      listing.year,
      `${formatNumber(listing.mileage)} ${t("units.km")}`,
      tOptions(`fuel.${listing.fuel}`),
      tOptions(`transmission.${listing.transmission}`),
    ].join(" · ");
}
