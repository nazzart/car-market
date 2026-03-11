"use client"

import { Listing } from "../types/types"
import ListingCard from "./ListingCard"

const listings: Listing[] = [
  {
    id: "1",
    title: "Audi Q2 35 TFSI",
    year: 2022,
    price: 20900,
    km: 12000,
    fuel: "Petrol",
    transmission: "Automatic",
    location: "Moscow",
    status: "active",
    views: 120,
    image:
      "/cars/bmw.jpg"
  },
  {
    id: "2",
    title: "BMW 3 Series",
    year: 2021,
    price: 32500,
    km: 35000,
    fuel: "Petrol",
    transmission: "Automatic",
    location: "Berlin",
    status: "active",
    views: 88,
    image:
    "/cars/bmw.jpg"
}
]

export default function ListingsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">

      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
        />
      ))}

    </div>
  )
}