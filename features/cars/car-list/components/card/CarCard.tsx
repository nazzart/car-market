"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

import { IconButton, Tooltip } from "@mui/material";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import PhoneIcon from "@mui/icons-material/Phone";

type SellerType = "dealer" | "private";

type CarCardProps = {
  id: string;
  title: string;
  year: number;
  mileage: string;
  engine: string;
  power: string;
  drive: string;
  engineType: string;
  price: string;
  location: string;
  sellerType: SellerType;
  dealerName?: string;
  images: string[];
  totalImages: number;
};

export default function CarCard({
  id,
  title,
  year,
  mileage,
  engine,
  power,
  engineType,
  price,
  location,
  sellerType,
  dealerName,
  images,
  totalImages,
}: CarCardProps) {
  const limitedImages = images.slice(0, 5);
  const previewImages = limitedImages.slice(0, 5);
  const remaining = totalImages - previewImages.length;

  const [activeImage, setActiveImage] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const percent = x / bounds.width;

    const index = Math.floor(percent * previewImages.length);

    setActiveImage(Math.min(previewImages.length - 1, Math.max(0, index)));
  };

  return (
    <Link href={`/cars/${id}`} className="block">
      <div className="flex flex-col sm:flex-row gap-5 py-5 px-0 sm:p-5 rounded-2xl sm:hover:bg-gray-50 sm:hover:shadow-sm transition-all duration-200 ease-out">
        {/* ---------------- MOBILE GALLERY ---------------- */}
        <div className="sm:hidden scroll-smooth w-full overflow-x-auto scrollbar-none flex gap-2 snap-x snap-mandatory scroll-pl-5 pb-1 pl-5">
          {limitedImages.map((img, i) => {
            const isLast = i === limitedImages.length - 1;

            return (
              <div
                key={i}
                className={`relative flex-shrink-0 w-[85%] h-[200px] snap-start overflow-hidden ${
                  isLast ? "rounded-l-lg rounded-r-none" : "rounded-lg"
                }`}
              >
                <Image
                  src={img}
                  alt={title}
                  fill
                  sizes="85vw"
                  className="object-cover"
                />
              </div>
            );
          })}

          {/* CALL SELLER SLIDE */}

          <div className="flex-shrink-0 w-[25%] snap-start -ml-2">
            <div className="w-full h-full bg-green-600 active:bg-green-700 transition flex flex-col items-center justify-center text-white gap-2">
              <PhoneIcon sx={{ fontSize: 34 }} />
              <span className="font-semibold text-sm">Call seller</span>
            </div>
          </div>
        </div>
        {/* ---------------- DESKTOP IMAGE ---------------- */}
        <div
          className="hidden sm:block group relative w-[240px] h-[160px] flex-shrink-0 overflow-hidden rounded-lg cursor-pointer"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setActiveImage(0)}
        >
          <Image
            src={previewImages[activeImage]}
            alt={title}
            fill
            sizes="240px"
            className="object-cover"
          />

          {/* LAST IMAGE OVERLAY */}

          {remaining > 0 && activeImage === previewImages.length - 1 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold text-lg">
              +{remaining}
            </div>
          )}

          {/* PROGRESS BARS */}

          {previewImages.length > 1 && (
            <div className="absolute top-2 left-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
              {previewImages.map((_, i) => (
                <div
                  key={i}
                  className={`h-[3px] flex-1 rounded-full ${
                    i <= activeImage ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        {/* ---------------- CONTENT ---------------- */}
        <div className="flex flex-1 gap-4 px-5 sm:p-0">
          <div className="flex flex-col flex-1 gap-1">
            {/* TITLE */}

            <h3 className="font-semibold text-lg sm:text-xl leading-tight transition hover:text-gray-700">
              {title}
            </h3>

            {/* PRICE */}

            <div className="text-2xl font-bold text-gray-900">{price}</div>

            {/* SPECS */}

            <div className="text-[15px] text-gray-600 flex flex-wrap gap-x-2 sm:pt-4">
              <span>{year}</span>
              <span className="text-gray-400">•</span>
              <span>{mileage}</span>
              <span className="text-gray-400">•</span>
              <span>{engine}</span>
              <span className="text-gray-400">•</span>
              <span>{power}</span>
              <span className="text-gray-400">•</span>
              <span>{engineType}</span>
            </div>

            {/* SELLER */}

            <div className="mt-auto text-sm text-gray-500">
              {sellerType === "dealer" ? (
                <div className="flex flex-col">
                  <span>
                    <span className="font-semibold">Dealer</span> · {location}
                  </span>
                </div>
              ) : (
                <span>Private seller · {location}</span>
              )}
            </div>
          </div>

          {/* ACTIONS */}

          <div
            className="flex flex-col items-end gap-2"
            onClick={(e) => e.preventDefault()}
          >
            <div className="flex gap-1">
              <Tooltip title="Add to favorites" arrow>
                <IconButton
                  size="small"
                  sx={{
                    color: "#6b7280",
                    "&:hover": {
                      color: "#111827",
                      backgroundColor: "#f3f4f6",
                    },
                  }}
                >
                  <FavoriteBorderIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Compare car" arrow>
                <IconButton
                  size="small"
                  sx={{
                    color: "#6b7280",
                    "&:hover": {
                      color: "#111827",
                      backgroundColor: "#f3f4f6",
                    },
                  }}
                >
                  <CompareArrowsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
