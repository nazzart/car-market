import { useLocale, useTranslations } from "next-intl";

import MetaLine from "@/components/ui/MetaLine";
import CarPhoto from "@/components/ui/CarPhoto";
import { Link } from "@/i18n/navigation";
import { formatAgo, formatPrice } from "@/lib/utils";

import { Listing } from "@/features/cars/types";

import FreshBadge from "@/features/cars/car-list/components/FreshBadge";
import { isFresh } from "@/features/cars/lib/isFresh";
import { useSpecLine } from "@/features/cars/lib/useSpecLine";

import FavoriteButton from "./FavoriteButton";
import CompareButton from "@/features/compare/components/CompareButton";
import DealerName from "@/features/dealers/components/DealerName";
import { usePlaceName } from "@/lib/places";

type CarCardProps = { listing: Listing };

export default function CarCard({ listing }: CarCardProps) {
  const t = useTranslations("common");
  const specLine = useSpecLine();
  const placeName = usePlaceName();
  const locale = useLocale();

  const { id, title, price } = listing;
  const image = listing.images[0];

  return (
    <article className="group relative">
      <Link href={`/listing/${id}`} className="block">
        <CarPhoto
          src={image}
          alt={title}
          sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 50vw"
          className="rounded-xl"
          imageClassName="transition duration-300 group-hover:scale-[1.03]"
          iconSize={48}
          label={t("noPhoto")}
        />

        <div className="pt-3 space-y-0.5">
          <div className="text-lg font-semibold text-gray-900">
            {formatPrice(price)}
          </div>

          <div className="text-gray-900 truncate group-hover:text-primary transition">
            {title}
          </div>

          <div className="text-sm text-gray-500 truncate">
            {specLine(listing)}
          </div>

          {/* дилер — отдельной строкой: в узкой карточке рядом с городом название обрезалось бы */}
          {listing.sellerType === "dealer" && listing.sellerName && (
            <DealerName name={listing.sellerName} verified={listing.dealerVerified} className="flex pt-1 text-sm" />
          )}

          <MetaLine className="pt-1" items={[placeName(listing.city), formatAgo(listing.postedMinutesAgo, locale)]} />
        </div>
      </Link>

      {isFresh(listing) && <FreshBadge className="absolute top-2 left-2 pointer-events-none" />}

      <div className="absolute top-2 right-2 flex gap-1.5">
        {/* на телефоне карточки узкие — «сравнить» есть на странице объявления и в списке */}
        <CompareButton id={listing.id} revealOnHover className="hidden sm:flex" />
        <FavoriteButton listing={listing} />
      </div>
    </article>
  );
}
