"use client";

import { useTranslations } from "next-intl";
import StarIcon from "@mui/icons-material/Star";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import Badge from "@/components/ui/Badge";
import { brands } from "@/features/brands/data/brands";
import { usePlaceName } from "@/lib/places";
import PhoneButton from "@/features/cars/car-list/components/PhoneButton";
import { Link } from "@/i18n/navigation";
import { initials } from "@/lib/utils";

import { Dealer } from "@/features/dealers/types";
import { formatHours } from "@/features/dealers/lib/hours";
import { hasRating } from "@/features/dealers/lib/rating";
import OpenStatus from "./OpenStatus";
import VerifiedBadge from "./VerifiedBadge";

type Props = {
  dealer: Dealer;
  active: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
};

const brandName = (slug: string) => brands.find((b) => b.slug === slug)?.name ?? slug;

export default function DealerCard({ dealer, active, onSelect, onHover }: Props) {
  const t = useTranslations("dealers");
  const tCommon = useTranslations("common");
  const tOptions = useTranslations("options");
  const placeName = usePlaceName();
  const official = dealer.type === "official";

  return (
    <article
      id={`dealer-${dealer.slug}`}
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`
        scroll-mt-20
        p-4
        rounded-2xl
        border
        bg-white
        cursor-pointer
        transition
        ${
          active
            ? "border-gray-900 ring-1 ring-gray-900"
            : "border-gray-200 hover:border-gray-300 hover:shadow-lg hover:shadow-black/5"
        }
      `}
    >
      <div className="flex gap-4">
        {/* Logo */}

        <span className="w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl bg-gray-900 text-white font-bold">
          {initials(dealer.name)}
        </span>

        {/* Info */}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h3 className="font-semibold text-gray-900 truncate">
              <Link
                href={`/dealers/${dealer.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:underline underline-offset-4"
              >
                {dealer.name}
              </Link>
            </h3>
            <VerifiedBadge slug={dealer.slug} />
          </div>

          <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-500">
            <span>{official ? t("official") : t("used")}</span>
            {hasRating(dealer) && (
              <>
                <span className="inline-flex items-center gap-0.5 text-gray-900">
                  <StarIcon sx={{ fontSize: 15 }} className="text-amber-500" />
                  {dealer.rating!.toFixed(1)}
                </span>
                <span>
                  {tCommon("reviews", { count: dealer.reviews! })}
                </span>
              </>
            )}
          </div>

          {official && dealer.brands.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {dealer.brands.map((b) => (
                <Badge key={b}>{brandName(b)}</Badge>
              ))}
            </div>
          )}

          <div className="mt-3 space-y-1 text-sm text-gray-700">
            <div className="flex items-start gap-1.5">
              <PlaceOutlinedIcon sx={{ fontSize: 17 }} className="text-gray-500 mt-px shrink-0" />
              {dealer.address}, {placeName(dealer.city)}
            </div>
            <div className="flex items-start gap-1.5">
              <ScheduleOutlinedIcon sx={{ fontSize: 17 }} className="text-gray-500 mt-px shrink-0" />
              <div>
                <OpenStatus hours={dealer.hours} />
                <div className="text-xs text-gray-500">{formatHours(dealer.hours, (d) => tOptions(`days.${d}`))}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}

      <div
        className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <Link
          href={`/cars?dealer=${dealer.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-primary transition"
        >
          {t("inStock", { count: dealer.carsInStock })}
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Link>

        <PhoneButton phone={dealer.phone} />
      </div>
    </article>
  );
}
