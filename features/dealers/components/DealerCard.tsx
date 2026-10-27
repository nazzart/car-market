"use client";

import Link from "next/link";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { brands } from "@/features/brands/data/brands";
import PhoneButton from "@/features/cars/car-list/components/PhoneButton";
import { formatNumber, plural } from "@/lib/utils";

import { Dealer } from "../data/dealers";

type Props = {
  dealer: Dealer;
  active: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
};

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const brandName = (slug: string) => brands.find((b) => b.slug === slug)?.name ?? slug;

export default function DealerCard({ dealer, active, onSelect, onHover }: Props) {
  const official = dealer.type === "official";

  return (
    <article
      id={`dealer-${dealer.slug}`}
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`
        scroll-mt-24
        p-4 sm:p-5
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

        <span className="w-14 h-14 shrink-0 flex items-center justify-center rounded-2xl bg-gray-900 text-white font-bold">
          {initials(dealer.name)}
        </span>

        {/* Info */}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h3 className="font-semibold text-gray-900 truncate">{dealer.name}</h3>
            {official && (
              <VerifiedIcon
                sx={{ fontSize: 16 }}
                className="text-sky-600 shrink-0"
                titleAccess="Официальный дилер"
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-500">
            <span>{official ? "Официальный дилер" : "Автосалон с пробегом"}</span>
            <span className="inline-flex items-center gap-0.5 text-gray-900">
              <StarIcon sx={{ fontSize: 15 }} className="text-amber-500" />
              {dealer.rating.toFixed(1)}
            </span>
            <span>
              {formatNumber(dealer.reviews)}{" "}
              {plural(dealer.reviews, ["отзыв", "отзыва", "отзывов"])}
            </span>
          </div>

          {official && dealer.brands.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {dealer.brands.map((b) => (
                <span
                  key={b}
                  className="px-2 py-0.5 rounded-md bg-gray-100 text-xs font-medium text-gray-700"
                >
                  {brandName(b)}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 space-y-1 text-sm text-gray-700">
            <div className="flex items-start gap-1.5">
              <PlaceOutlinedIcon sx={{ fontSize: 17 }} className="text-gray-500 mt-px" />
              {dealer.city}, {dealer.address}
            </div>
            <div className="flex items-start gap-1.5">
              <ScheduleOutlinedIcon sx={{ fontSize: 17 }} className="text-gray-500 mt-px" />
              {dealer.hours}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}

      <div
        className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <Link
          href={`/cars?dealer=${dealer.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-primary transition"
        >
          {formatNumber(dealer.carsInStock)}{" "}
          {plural(dealer.carsInStock, ["автомобиль", "автомобиля", "автомобилей"])} в наличии
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Link>

        <PhoneButton phone={dealer.phone} />
      </div>
    </article>
  );
}
