import { useTranslations } from "next-intl";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";

import { Link } from "@/i18n/navigation";
import { initials } from "@/lib/utils";

import { ContactPerson } from "./ListingPhone";
import VerifiedBadge from "@/features/dealers/components/VerifiedBadge";
import { Listing } from "@/features/cars/types";
import { usePlaceName } from "@/lib/places";

type SellerInfoProps = { listing: Listing };

export default function SellerInfo({ listing }: SellerInfoProps) {
  const t = useTranslations("listing.seller");
  const tCommon = useTranslations("common");
  const placeName = usePlaceName();
  const isDealer = listing.sellerType === "dealer";
  const name = isDealer ? listing.sellerName ?? t("dealer") : t("private");

  return (
    <div className="flex items-start gap-3">
      <span className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full bg-gray-900 text-white font-semibold">
        {isDealer ? initials(name) : <PersonOutlineIcon />}
      </span>

      <div className="min-w-0">
        <div className="flex items-center gap-1 font-semibold text-gray-900">
          {listing.dealer ? (
            <Link href={`/dealers/${listing.dealer}`} className="truncate hover:underline underline-offset-4">
              {name}
            </Link>
          ) : (
            <span className="truncate">{name}</span>
          )}
          <VerifiedBadge verified={listing.dealerVerified} />
        </div>

        <div className="text-sm text-gray-500">
          {isDealer ? t("dealer") : t("seller")}
          {listing.sellerSince && ` · ${t("since", { year: listing.sellerSince })}`}
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-700 mt-1">
          <PlaceOutlinedIcon sx={{ fontSize: 16 }} className="text-gray-500" />
          {placeName(listing.city)}, {tCommon("latvia")}
        </div>

        <ContactPerson listing={listing} className="mt-2" />

        {listing.dealer && (
          <Link
            href={`/dealers/${listing.dealer}`}
            className="inline-block mt-2 text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-primary"
          >
            {t("dealerPage")}
          </Link>
        )}
      </div>
    </div>
  );
}
