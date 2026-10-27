import { brands } from "@/features/brands/data/brands";
import { formatNumber } from "@/lib/utils";

import { Listing } from "../../data/listings";
import {
  bodyTypeOptions,
  driveOptions,
  fuelOptions,
  labelOf,
  transmissionOptions,
} from "../../config/filterOptions";

export default function SpecsTable({ listing }: { listing: Listing }) {
  const rows: [string, string | null | undefined][] = [
    ["Марка", brands.find((b) => b.slug === listing.brand)?.name],
    ["Год выпуска", String(listing.year)],
    ["Пробег", `${formatNumber(listing.mileage)} км`],
    ["Кузов", labelOf(bodyTypeOptions, listing.bodyType)],
    ["Цвет", listing.color],
    ["Двигатель", listing.engine ? `${listing.engine.toFixed(1)} л` : null],
    ["Мощность", `${listing.power} л.с.`],
    ["Топливо", labelOf(fuelOptions, listing.fuel)],
    ["Коробка", labelOf(transmissionOptions, listing.transmission)],
    ["Привод", labelOf(driveOptions, listing.drive)],
    ["Владельцев", listing.owners ? String(listing.owners) : null],
    ["Техосмотр", listing.inspectionUntil ? `до ${listing.inspectionUntil}` : null],
    ["Состояние", listing.condition === "new" ? "Новый" : "С пробегом"],
    ["VIN", listing.vin],
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
            <dt className="text-gray-500">{label}</dt>
            <dd
              className={`font-medium text-gray-900 text-right ${
                label === "VIN" ? "font-mono text-sm tracking-wide" : ""
              }`}
            >
              {value}
            </dd>
          </div>
        ))}
    </dl>
  );
}
