import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { listings } from "@/features/cars/data/listings";

import CarCard from "./CarCard";

// На главной — только объявления с фото: это «витрина» сайта
const HOMEPAGE_LIMIT = 6;

const homepageListings = listings
  .filter((listing) => listing.images.length > 0)
  .slice(0, HOMEPAGE_LIMIT);

export default function CarGrid() {
  return (
    <section className="py-8">
      <div className="flex items-end justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Свежие объявления</h2>

        <Link
          href="/cars"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-black transition"
        >
          Смотреть все
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8">
        {homepageListings.map((listing) => (
          <CarCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
