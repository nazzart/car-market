"use client";

import Image from "next/image";
import { IconButton, Rating, Chip } from "@mui/material";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import ShareIcon from "@mui/icons-material/Share";

type SellerType = "dealer" | "private";

type CarCardProps = {
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
  rating?: number;
  image: string;
};

export default function CarCard({
  title,
  year,
  mileage,
  engine,
  power,
  drive,
  engineType,
  price,
  location,
  sellerType,
  dealerName,
  rating,
  image,
}: CarCardProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl transition-colors hover:bg-gray-50">
      {/* IMAGE */}
      <div className="relative w-full sm:w-[200px] h-[150px] sm:h-[130px] flex-shrink-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 gap-4">
        <div className="flex flex-col flex-1 gap-1">
          {/* TITLE */}
          <h3 className="font-semibold text-base sm:text-lg leading-tight">
            {title}
          </h3>

          {/* PRICE (NOW EASY TO SEE) */}
          <div className="text-xl font-bold text-green-700">{price}</div>

          {/* SPECS */}
          <div className="text-sm text-gray-600 flex flex-wrap gap-x-2">
            <span>{year}</span>
            <span>•</span>
            <span>{mileage}</span>
            <span>•</span>
            <span>{engine}</span>
            <span>•</span>
            <span>{power}</span>
            <span>•</span>
            <span>{engineType}</span>
          </div>

          {/* SELLER */}
          <div className="mt-auto flex items-center gap-2 text-sm text-gray-600">
            {sellerType === "dealer" ? (
              <>
                <span className="font-medium">{dealerName || "Автосалон"}</span>

                {rating && (
                  <>
                    <Rating
                      value={rating}
                      precision={0.1}
                      readOnly
                      size="small"
                    />
                    <span>{rating}</span>
                  </>
                )}

                <span>• {location}</span>
              </>
            ) : (
              <>
                <span className="font-medium">Частное лицо</span>
                <span>• {location}</span>
              </>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col justify-between items-end">
          <div className="flex gap-1">
            <IconButton size="small">
              <FavoriteBorderIcon fontSize="small" />
            </IconButton>

            <IconButton size="small">
              <CompareArrowsIcon fontSize="small" />
            </IconButton>

            <IconButton size="small">
              <ShareIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
