import { useTranslations } from "next-intl";

import { cn, formatNumber } from "@/lib/utils";

import { gaugeSegments, mileageLevel, mileagePerYear } from "../../lib/mileage";
import type { Listing } from "../../types";

type MileageGaugeProps = {
  listing: Pick<Listing, "year" | "mileage" | "condition">;
  size?: "sm" | "md"; // sm — рядом с пробегом в строке списка; md — в плитке «Nobraukums» на странице объявления
  className?: string;
};

const tone = { low: "bg-success-solid", average: "bg-gray-700", high: "bg-warning-solid" } as const;

// «Указатель топлива» из 5 делений: сколько машина проезжала в год. Мало — зелёный, много — жёлтый.
// Подпись для читалок экрана и подсказка при наведении — «≈ 12 800 km gadā, vidēji»
export default function MileageGauge({ listing, size = "sm", className }: MileageGaugeProps) {
  const t = useTranslations("common.mileageGauge");
  const perYear = mileagePerYear(listing);
  if (perYear === null) return null;

  const level = mileageLevel(perYear);
  const filled = gaugeSegments(perYear);
  const label = t("label", { km: formatNumber(perYear), level: t(level) });

  return (
    <span role="img" aria-label={label} title={label} className={cn("inline-flex items-end gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            "rounded-full",
            size === "sm" ? "w-1 h-2.5" : "w-3.5 h-1.5",
            i <= filled ? tone[level] : "bg-gray-200"
          )}
        />
      ))}
    </span>
  );
}
