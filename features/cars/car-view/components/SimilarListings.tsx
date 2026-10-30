import { getTranslations } from "next-intl/server";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import CarCard from "@/features/latest-cars/components/CarCard";
import { Link } from "@/i18n/navigation";

import { Listing } from "@/features/cars/types";
import { getSimilarListings } from "../../api";

const LIMIT = 3;

type SimilarListingsProps = { listing: Listing };

// Сначала та же марка, потом тот же кузов; с фото — в приоритете
export default async function SimilarListings({ listing }: SimilarListingsProps) {
  const t = await getTranslations("listing.similar");
  const similar = await getSimilarListings(listing, LIMIT);

  if (similar.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t border-gray-100">
      <div className="flex items-end justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>

        <Link
          href={`/cars?brand=${listing.brand}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-black transition"
        >
          {t("all", { brand: listing.brandName })}
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8">
        {similar.map((l) => (
          <CarCard key={l.id} listing={l} />
        ))}
      </div>
    </section>
  );
}
