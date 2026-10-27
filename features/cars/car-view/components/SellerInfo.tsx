import Link from "next/link";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";

import { initials } from "@/lib/utils";

import { Listing } from "../../data/listings";

export default function SellerInfo({ listing }: { listing: Listing }) {
  const isDealer = listing.sellerType === "dealer";
  const name = isDealer ? listing.sellerName ?? "Дилер" : "Частное лицо";

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
          {isDealer && (
            <VerifiedIcon sx={{ fontSize: 16 }} className="text-sky-600" titleAccess="Проверенный дилер" />
          )}
        </div>

        <div className="text-sm text-gray-500">
          {isDealer ? "Дилер" : "Продавец"}
          {listing.sellerSince && ` · на сайте с ${listing.sellerSince} г.`}
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-700 mt-1">
          <PlaceOutlinedIcon sx={{ fontSize: 16 }} className="text-gray-500" />
          {listing.city}, Латвия
        </div>

        {listing.dealer && (
          <Link
            href={`/dealers/${listing.dealer}`}
            className="inline-block mt-2 text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-primary"
          >
            Страница дилера и все авто
          </Link>
        )}
      </div>
    </div>
  );
}
