import { getTranslations } from "next-intl/server";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";

import VerifiedBadge from "@/features/dealers/components/VerifiedBadge";
import OpenStatus from "@/features/dealers/components/OpenStatus";
import { getDealers } from "@/features/dealers/api";
import { Link } from "@/i18n/navigation";
import { cityLabel } from "@/lib/cities";
import { initials } from "@/lib/utils";

export default async function DealersTeaser() {
  const [t, tDealers, tOptions, dealers] = await Promise.all([
    getTranslations("home.dealers"),
    getTranslations("dealers"),
    getTranslations("options"),
    getDealers(),
  ]);
  // самые крупные салоны — по числу авто в наличии
  const topDealers = [...dealers].sort((a, b) => b.carsInStock - a.carsInStock).slice(0, 4);

  return (
    <section className="py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{t("title")}</h2>
          <p className="text-gray-500 mt-1">{t("subtitle", { count: dealers.length })}</p>
        </div>

        <Link
          href="/dealers"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-gray-900 hover:bg-black text-white text-sm font-semibold transition"
        >
          <MapOutlinedIcon fontSize="small" />
          {t("map")}
        </Link>
      </div>

      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 snap-x scroll-px-4">
        {topDealers.map((d) => (
          <Link
            key={d.slug}
            href={`/dealers/${d.slug}`}
            className="group snap-start shrink-0 w-64 sm:w-auto flex flex-col gap-4 p-4 rounded-2xl border border-gray-200 bg-white hover:border-gray-900 hover:shadow-lg hover:shadow-black/5 transition"
          >
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl bg-gray-900 text-white font-bold">
                {initials(d.name)}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-900 truncate">{d.name}</span>
                  <VerifiedBadge slug={d.slug} />
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {cityLabel(tOptions, d.city)} · {d.type === "official" ? tDealers("official") : tDealers("used")}
                </div>
              </div>
            </div>

            <OpenStatus hours={d.hours} />

            <span className="mt-auto pt-3 border-t border-gray-100 inline-flex items-center justify-between text-sm font-semibold text-gray-900">
              {tDealers("inStock", { count: d.carsInStock })}
              <ArrowForwardIcon sx={{ fontSize: 16 }} className="text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-900" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
