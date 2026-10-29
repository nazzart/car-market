"use client";

import { useDealerLookup } from "@/features/dealers/api";
import type { Dealer } from "@/features/dealers/types";
import { Point, distanceKm } from "@/lib/geo";
import { PLACES, placePoint } from "@/lib/places";
import { createLocalStore } from "@/lib/localStore";

import type { Listing } from "@/features/cars/types";

// Откуда считать расстояние: точка из браузера (geolocation) или выбранный город.
// Хранится только в браузере посетителя и не попадает в ссылку — ей можно делиться
export type Origin = Point & { source: "gps" | "city"; city?: string };

const store = createLocalStore<Origin | null>("bestauto.origin", null);

export const useOrigin = store.useValue;
export const setOrigin = store.set;
export const clearOrigin = () => store.set(null);

// Где машина: адрес дилера, иначе центр города или края объявления
function listingPoint(listing: Listing, dealer: Dealer | undefined): Point | null {
  if (dealer) return { lat: dealer.lat, lng: dealer.lng };
  return placePoint(listing.city);
}

// Расстояние до объявления, км; undefined — посетитель не указал, где он (радиус не учитывается)
export function useDistanceTo(origin: Point | null) {
  const dealerOf = useDealerLookup();
  if (!origin) return undefined;

  return (listing: Listing) => {
    const point = listingPoint(listing, dealerOf(listing.dealer));
    return point ? distanceKm(origin, point) : null;
  };
}

// Ближайший город — подпись для точки GPS («рядом: Сигулда»); края не берём — «рядом с Ogres novads» звучит странно
export function nearestCity(point: Point) {
  const cities = PLACES.filter((p) => p.kind === "city");
  return cities.reduce((best, p) => (distanceKm(point, p) < distanceKm(point, best) ? p : best)).key;
}

// Округление для показа: «3 km», «45 km», «120 km»
export const roundKm = (km: number) => (km < 10 ? Math.max(1, Math.round(km)) : Math.round(km / 5) * 5);
