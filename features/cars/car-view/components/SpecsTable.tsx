import { brands } from "@/features/brands/data/brands";
import { useTranslations } from "next-intl";

import { Listing } from "@/features/cars/types";
import VinReveal from "./VinReveal";

type SpecsTableProps = { listing: Listing };

export default function SpecsTable({ listing }: SpecsTableProps) {
  const t = useTranslations("listing.specs");
  const tOptions = useTranslations("options");

  const rows: [string, React.ReactNode][] = [
    ["brand", brands.find((b) => b.slug === listing.brand)?.name],
    // год, пробег, двигатель, мощность, коробка и привод — в карточках над описанием
    ["body", tOptions(`bodyType.${listing.bodyType}`)],
    ["color", listing.color && tOptions(`colors.${listing.color}`)],
    ["owners", listing.owners ? String(listing.owners) : null],
    ["inspection", listing.inspectionUntil ? t("inspectionUntil", { date: listing.inspectionUntil }) : null],
    ["condition", listing.condition === "new" ? t("conditionNew") : t("conditionUsed")],
    ["vin", listing.vin && <VinReveal vin={listing.vin} />],
  ];

  return (
    <dl className="grid sm:grid-cols-2 gap-x-10">
      {rows
        .filter(([, value]) => value)
        .map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 min-h-12 py-2 border-b border-gray-100"
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
