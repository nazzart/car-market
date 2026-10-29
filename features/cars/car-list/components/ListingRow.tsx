import { useLocale, useTranslations } from "next-intl";

import MetaLine from "@/components/ui/MetaLine";
import Badge from "@/components/ui/Badge";
import FavoriteButton from "@/features/latest-cars/components/FavoriteButton";
import CompareButton from "@/features/compare/components/CompareButton";
import { Link } from "@/i18n/navigation";
import { formatAgo, formatNumber, formatPrice } from "@/lib/utils";

import { Listing } from "@/features/cars/types";
import { isFresh } from "../../lib/isFresh";
import ListingGallery from "./ListingGallery";
import ListingPhone from "@/features/cars/car-view/components/ListingPhone";
import { usePlaceName } from "@/lib/places";

type ListingRowProps = { listing: Listing };

export default function ListingRow({ listing }: ListingRowProps) {
  const t = useTranslations("cars.row");
  const tCommon = useTranslations("common");
  const tOptions = useTranslations("options");
  const placeName = usePlaceName();
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
        rounded-card
        border border-gray-200
        bg-white
        hover:border-gray-300
        hover:shadow-lg hover:shadow-black/5
        transition
      "
    >
      {/* Photo */}

      <div className="relative md:w-[260px] lg:w-[280px] shrink-0">
        <ListingGallery href={href} title={listing.title} images={listing.images} fresh={isFresh(listing)} />
        <FavoriteButton listing={listing} className="absolute top-2 right-2 z-20" />
        <CompareButton id={listing.id} className="absolute top-14 right-2 z-20" />
      </div>

      {/* Info */}

      <div className="flex-1 min-w-0 flex flex-col lg:flex-row gap-3 lg:gap-6 px-1 pb-1 md:p-1">
        <div className="flex-1 min-w-0 flex flex-col">
          {/* ссылка растянута на всю карточку через after: */}
          <Link
            href={href}
            className="after:absolute after:inset-0 after:rounded-card"
          >
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition truncate">
              {listing.title}
            </h3>
          </Link>

          <div className="text-sm text-gray-800 mt-1">{specs.join(" · ")}</div>
          <div className="text-sm text-gray-500 mt-0.5">{details.join(" · ")}</div>

          <div className="flex flex-wrap items-center gap-1.5 mt-3 empty:hidden">
            {listing.condition === "new" && (
              <Badge tone="success">{t("new")}</Badge>
            )}


            {/* сигналы доверия — то, что покупатель спрашивает первым */}
            {listing.noAccidents && (
              <Badge tone="success">{t("noAccidents")}</Badge>
            )}

            {listing.owners === 1 && (
              <Badge tone="info">{t("oneOwner")}</Badge>
            )}

            {/* единственный «минус», о котором стоит знать до клика */}
            {listing.overallCondition === "repair" && (
              <Badge tone="warning">{tOptions("overallCondition.repair")}</Badge>
            )}
          </div>

          {/* продавец — обычной строкой, а не чипом: чипы только для важного о самой машине */}
          <MetaLine
            className="mt-auto pt-3"
            items={[
              placeName(listing.city),
              listing.sellerType === "dealer" ? t("dealer", { name: listing.sellerName ?? "" }) : t("private"),
              formatAgo(listing.postedMinutesAgo, locale),
            ]}
          />
        </div>

        {/* Price + actions */}

        <div className="lg:w-48 shrink-0 flex lg:flex-col items-center lg:items-end justify-between gap-3">
          <div className="lg:text-right">
            <div className="text-2xl font-bold text-gray-900 whitespace-nowrap">{formatPrice(listing.price)}</div>
            {listing.negotiable && <div className="text-xs font-medium text-success">{t("negotiable")}</div>}
          </div>

          <ListingPhone listing={listing} />
        </div>
      </div>
    </article>
  );
}
