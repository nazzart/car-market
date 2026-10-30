import { useTranslations } from "next-intl";

import { cn, formatPrice } from "@/lib/utils";

import type { Listing } from "../../types";

type LeasingOfferProps = {
  listing: Pick<Listing, "price" | "leasingMonthly" | "leasingDownPayment" | "leasingMonths">;
  className?: string;
};

// Лизинг дилера под ценой на странице объявления: платёж в месяц, первый взнос (% и €) и срок
export default function LeasingOffer({ listing, className }: LeasingOfferProps) {
  const t = useTranslations("listing.leasing");
  const { price, leasingMonthly, leasingDownPayment, leasingMonths } = listing;
  if (!leasingMonthly) return null;

  const terms = [
    leasingDownPayment !== undefined &&
      t("down", { percent: leasingDownPayment, amount: formatPrice(Math.round((price * leasingDownPayment) / 100)) }),
    leasingMonths !== undefined && t("months", { count: leasingMonths }),
  ].filter(Boolean);

  return (
    <div className={cn("rounded-xl bg-gray-50 px-4 py-3", className)}>
      <div className="font-semibold text-gray-900">{t("monthly", { amount: formatPrice(leasingMonthly) })}</div>
      {terms.length > 0 && <div className="text-sm text-gray-600 mt-0.5">{terms.join(" · ")}</div>}
      <div className="text-xs text-gray-500 mt-1">{t("note")}</div>
    </div>
  );
}
