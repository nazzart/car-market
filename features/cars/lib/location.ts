"use client";

import { dealers } from "@/features/dealers/data/dealers";
import { CITY_COORDS, Point, distanceKm } from "@/lib/geo";
import { createLocalStore } from "@/lib/localStore";

import type { Listing } from "../data/listings";

// Откуда считать расстояние: точка из браузера (geolocation) или выбранный город.
// Хранится только в браузере посетителя и не попадает в ссылку — ей можно делиться
export type Origin = Point & { source: "gps" | "city"; city?: string };

const store = createLocalStore<Origin | null>("bestauto.origin", null);

export const useOrigin = store.useValue;
export const setOrigin = store.set;
export const clearOrigin = () => store.set(null);

// Где машина: адрес дилера, иначе центр города объявления
export function listingPoint(listing: Listing): Point | null {
  const dealer = listing.dealer && dealers.find((d) => d.slug === listing.dealer);
  if (dealer) return { lat: dealer.lat, lng: dealer.lng };
  return CITY_COORDS[listing.city] ?? null;
}

export function listingDistance(listing: Listing, origin: Point | null) {
  const point = listingPoint(listing);
  return origin && point ? distanceKm(origin, point) : null;
}

// Ближайший город из списка — подпись для точки GPS («рядом с Ригой»)
export function nearestCity(point: Point) {
  return Object.entries(CITY_COORDS).sort((a, b) => distanceKm(point, a[1]) - distanceKm(point, b[1]))[0][0];
}

// Округление для показа: «3 km», «45 km», «120 km»
export const roundKm = (km: number) => (km < 10 ? Math.max(1, Math.round(km)) : Math.round(km / 5) * 5);
