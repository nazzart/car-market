import { useTranslations } from "next-intl";

import { cn, formatPrice } from "@/lib/utils";

import type { Listing } from "../../types";

type LeasingPriceProps = {
  listing: Pick<Listing, "leasingMonthly" | "leasingDownPayment" | "leasingMonths">;
  className?: string;
};

// «Līzingā no 320 €/mēn.» под ценой на карточке — если дилер предлагает лизинг. Условия — во всплывающей подсказке
export default function LeasingPrice({ listing, className }: LeasingPriceProps) {
  const t = useTranslations("common.leasing");
  const { leasingMonthly, leasingDownPayment, leasingMonths } = listing;
  if (!leasingMonthly) return null;

  const terms = [
    leasingDownPayment !== undefined && t("down", { percent: leasingDownPayment }),
    leasingMonths !== undefined && t("months", { count: leasingMonths }),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className={cn("text-xs text-gray-500 whitespace-nowrap", className)} title={terms || undefined}>
      {t("monthly", { amount: formatPrice(leasingMonthly) })}
    </div>
  );
}
