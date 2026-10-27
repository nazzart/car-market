import { brands } from "@/features/brands/data/brands";
import { useTranslations } from "next-intl";

import { formatNumber } from "@/lib/utils";

import { Listing } from "../../data/listings";

export default function SpecsTable({ listing }: { listing: Listing }) {
  const t = useTranslations("listing.specs");
  const tCommon = useTranslations("common");
  const tOptions = useTranslations("options");

  const rows: [string, string | null | undefined][] = [
    ["brand", brands.find((b) => b.slug === listing.brand)?.name],
    ["year", String(listing.year)],
    ["mileage", `${formatNumber(listing.mileage)} ${tCommon("units.km")}`],
    ["body", tOptions(`bodyType.${listing.bodyType}`)],
    ["color", listing.color && tOptions(`colors.${listing.color}`)],
    ["engine", listing.engine ? `${listing.engine.toFixed(1)} ${tCommon("units.liters")}` : null],
    ["power", `${listing.power} ${tCommon("units.hp")}`],
    ["fuel", tOptions(`fuel.${listing.fuel}`)],
    ["gearbox", tOptions(`transmission.${listing.transmission}`)],
    ["drive", tOptions(`drive.${listing.drive}`)],
    ["owners", listing.owners ? String(listing.owners) : null],
    ["inspection", listing.inspectionUntil ? t("inspectionUntil", { date: listing.inspectionUntil }) : null],
    ["condition", listing.condition === "new" ? t("conditionNew") : t("conditionUsed")],
    ["vin", listing.vin],
  ];

  return (
    <dl className="grid sm:grid-cols-2 gap-x-10">
      {rows
        .filter(([, value]) => value)
        .map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-4 py-3 border-b border-gray-100"
          >
            <dt className="text-gray-500">{t(label)}</dt>
            <dd
              className={`font-medium text-gray-900 text-right ${
                label === "vin" ? "font-mono text-sm tracking-wide" : ""
              }`}
            >
              {value}
            </dd>
          </div>
        ))}
    </dl>
  );
}
