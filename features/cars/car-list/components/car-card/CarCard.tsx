"use client";

import Link from "next/link";

import { CarCardProps } from "./types";
import CarCardGallery from "./CarCardGallery";
import CarCardContent from "./CarCardContent";
import CarCardActions from "./CarCardActions";

export default function CarCard(props: CarCardProps) {
  const { id } = props;

  return (
    <Link href={`/cars/${id}`} className="block">
      <div className="flex flex-col sm:flex-row gap-5 py-5 px-0 sm:p-5 rounded-2xl sm:hover:bg-gray-50 sm:hover:shadow-sm transition-all duration-200 ease-out">
        <CarCardGallery {...props} />

        <div className="flex flex-1 gap-4 px-5 sm:p-0">
          <CarCardContent {...props} />
          <CarCardActions />
        </div>
      </div>
    </Link>
  );
}