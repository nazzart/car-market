import { useLocale, useTranslations } from "next-intl";

import FavoriteButton from "@/features/latest-cars/components/FavoriteButton";
import CompareButton from "@/features/compare/components/CompareButton";
import { Link } from "@/i18n/navigation";
import { formatAgo, formatNumber } from "@/lib/utils";

import { Listing } from "../../data/listings";
import ListingGallery from "./ListingGallery";
import PhoneButton from "./PhoneButton";

const badgeClass = "px-2 py-0.5 rounded-md text-xs font-medium";

export default function ListingRow({ listing }: { listing: Listing }) {
  const t = useTranslations("cars.row");
  const tCommon = useTranslations("common");
  const tOptions = useTranslations("options");
  const locale = useLocale();

  const href = `/listing/${listing.id}`;

  const specs = [
    String(listing.year),
    `${formatNumber(listing.mileage)} ${tCommon("units.km")}`,
    listing.engine ? `${listing.engine.toFixed(1)} ${tCommon("units.liters")}` : null,
    `${listing.power} ${tCommon("units.hp")}`,
    tOptions(`fuel.${listing.fuel}`),
  ].filter(Boolean);

  const details = [
    tOptions(`bodyType.${listing.bodyType}`),
    tOptions(`transmission.${listing.transmission}`),
    tOptions(`driveFull.${listing.drive}`),
  ];

  return (
    <article
      className="
        group relative
        flex flex-col md:flex-row gap-4 md:gap-5
        p-3
        rounded-2xl
        border border-gray-200
        bg-white
        hover:border-gray-300
        hover:shadow-lg hover:shadow-black/5
        transition
      "
    >
      {/* Photo */}

      <div className="relative md:w-[260px] lg:w-[280px] shrink-0">
        <ListingGallery href={href} title={listing.title} images={listing.images} />
        <FavoriteButton listing={listing} className="absolute top-2 right-2 z-20" />
        <CompareButton id={listing.id} className="absolute top-12 right-2 z-20" />
      </div>

      {/* Info */}

      <div className="flex-1 min-w-0 flex flex-col lg:flex-row gap-3 lg:gap-6 px-1 pb-1 md:p-1">
        <div className="flex-1 min-w-0 flex flex-col">
          {/* ссылка растянута на всю карточку через after: */}
          <Link
            href={href}
            className="after:absolute after:inset-0 after:rounded-2xl"
          >
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition truncate">
              {listing.title}
            </h3>
          </Link>

          <div className="text-sm text-gray-800 mt-1">{specs.join(" · ")}</div>
          <div className="text-sm text-gray-500 mt-0.5">{details.join(" · ")}</div>

          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {listing.condition === "new" && (
              <span className={`${badgeClass} bg-emerald-50 text-emerald-700`}>
                {t("new")}
              </span>
            )}

            {listing.tuned && (
              <span className={`${badgeClass} bg-amber-50 text-amber-700`}>
                {t("tuning")}
              </span>
            )}

            <span className={`${badgeClass} bg-gray-100 text-gray-700`}>
              {listing.sellerType === "dealer"
                ? t("dealer", { name: listing.sellerName ?? "" })
                : t("private")}
            </span>
          </div>

          <div className="text-xs text-gray-500 mt-auto pt-3">
            {tOptions(`cities.${listing.city}`)} · {formatAgo(listing.postedMinutesAgo, locale)}
          </div>
        </div>

        {/* Price + actions */}

        <div className="lg:w-48 shrink-0 flex lg:flex-col items-center lg:items-end justify-between gap-3">
          <div className="text-2xl font-bold text-gray-900 whitespace-nowrap">
            {formatNumber(listing.price)} €
          </div>

          <PhoneButton phone={listing.phone} />
        </div>
      </div>
    </article>
  );
}
