import Image from "next/image";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { formatAgo, formatNumber } from "@/lib/utils";

import { Listing } from "@/features/cars/types";

import FreshBadge from "@/features/cars/car-list/components/FreshBadge";
import { isFresh } from "@/features/cars/lib/isFresh";
import { roundKm } from "@/features/cars/lib/location";

import FavoriteButton from "./FavoriteButton";
import CompareButton from "@/features/compare/components/CompareButton";

export default function CarCard({ listing, distance }: { listing: Listing; distance?: number | null }) {
  const t = useTranslations("common");
  const tOptions = useTranslations("options");
  const tRow = useTranslations("cars.row");
  const locale = useLocale();

  const { id, title, year, price, mileage } = listing;
  const image = listing.images[0];

  return (
    <article className="group relative">
      <Link href={`/listing/${id}`} className="block">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 50vw"
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-300">
              <DirectionsCarOutlinedIcon sx={{ fontSize: 48 }} />
              <span className="text-xs text-gray-500">{t("noPhoto")}</span>
            </div>
          )}
        </div>

        <div className="pt-3 space-y-0.5">
          <div className="text-lg font-semibold text-gray-900">
            {formatNumber(price)} €
          </div>

          <div className="text-gray-900 truncate group-hover:text-primary transition">
            {title}
          </div>

          <div className="text-sm text-gray-500 truncate">
            {year} · {formatNumber(mileage)} {t("units.km")} · {tOptions(`fuel.${listing.fuel}`)} ·{" "}
            {tOptions(`transmission.${listing.transmission}`)}
          </div>

          <div className="text-xs text-gray-500 pt-1">
            {tOptions(`cities.${listing.city}`)}
            {distance != null && ` · ${tRow("distance", { km: roundKm(distance) })}`} ·{" "}
            {formatAgo(listing.postedMinutesAgo, locale)}
          </div>
        </div>
      </Link>

      {isFresh(listing) && <FreshBadge className="absolute top-2 left-2 pointer-events-none" />}

      <FavoriteButton listing={listing} className="absolute top-2 right-2" />
      {/* на телефоне карточки узкие — «сравнить» есть на странице объявления и в списке */}
      <CompareButton id={listing.id} className="absolute top-14 right-2 hidden sm:flex" />
    </article>
  );
}
