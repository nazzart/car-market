"use client"

import { Listing } from "../types/types"
import ListingMenu from "./ListingMenu"
import { Chip, Button } from "@mui/material"

type Props = {
  listing: Listing
}

export default function ListingCard({ listing }: Props) {

  const statusStyles = {
    active: {
      bg: "#ecfdf5",
      color: "#059669"
    },
    sold: {
      bg: "#f3f4f6",
      color: "#6b7280"
    },
    draft: {
      bg: "#fef3c7",
      color: "#d97706"
    }
  }

  const status = statusStyles[listing.status]

  return (
    <div
      className="
      group
      bg-white
      rounded-2xl
      overflow-hidden
      shadow-sm
      hover:shadow-xl
      hover:-translate-y-1
      transition-all
      duration-200
      "
    >

      {/* IMAGE */}
      <div className="relative h-48 overflow-hidden">

        <img
          src={listing.image}
          alt={listing.title}
          className="
          w-full
          h-full
          object-cover
          transition-transform
          duration-300
          group-hover:scale-105
          "
        />

        {/* HOVER OVERLAY */}
        <div
          className="
          absolute inset-0
          bg-black/40
          opacity-0
          group-hover:opacity-100
          transition
          flex items-center justify-center gap-3
          z-10
          "
        >
          <Button
            variant="contained"
            size="small"
          >
            View
          </Button>

          <Button
            variant="outlined"
            size="small"
            sx={{
              color: "white",
              borderColor: "white"
            }}
          >
            Edit
          </Button>
        </div>

        {/* MENU DOTS */}
        <div className="absolute top-3 right-3 z-20">
          <ListingMenu />
        </div>

      </div>

      {/* CONTENT */}
      <div className="p-4">

        <h3 className="font-semibold text-base">
          {listing.title} · {listing.year}
        </h3>

        <p className="text-lg font-semibold mt-1">
          ${listing.price.toLocaleString()}
        </p>

        <p className="text-sm text-gray-500 mt-2">
          {listing.km.toLocaleString()} km · {listing.fuel} · {listing.transmission}
        </p>

        <p className="text-sm text-gray-500">
          {listing.location}
        </p>

        {/* FOOTER */}
        <div className="flex items-center justify-between mt-4">

          <span className="text-xs text-gray-500">
            {listing.views} views
          </span>

          <Chip
            label={listing.status}
            size="small"
            sx={{
              backgroundColor: status.bg,
              color: status.color,
              fontWeight: 500
            }}
          />

        </div>

      </div>

    </div>
  )
}