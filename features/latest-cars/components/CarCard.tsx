import Image from "next/image";
import Link from "next/link";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";

import { formatNumber } from "@/lib/utils";

import { Listing } from "@/features/cars/data/listings";
import {
  fuelOptions,
  labelOf,
  transmissionOptions,
} from "@/features/cars/config/filterOptions";

import FavoriteButton from "./FavoriteButton";

export default function CarCard({ listing }: { listing: Listing }) {
  const { id, title, year, price, mileage, city, postedAt } = listing;
  const image = listing.images[0];
  const fuel = labelOf(fuelOptions, listing.fuel);
  const transmission = labelOf(transmissionOptions, listing.transmission);

  return (
    <article className="group relative">
      {/* TODO: страница объявления /listing/[id] ещё не создана */}
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
              <span className="text-xs text-gray-500">Нет фото</span>
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
            {year} · {formatNumber(mileage)} км · {fuel} · {transmission}
          </div>

          <div className="text-xs text-gray-500 pt-1">
            {city} · {postedAt}
          </div>
        </div>
      </Link>

      <FavoriteButton className="absolute top-2 right-2" />
    </article>
  );
}
