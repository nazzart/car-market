import { collections } from "@/features/collections/data/collections";

import { Listing } from "../data/listings";
import { postedPeriods } from "../config/filterOptions";

type Params = { get: (key: string) => string | null };

// distanceTo — расстояние до объявления в км (если посетитель указал, где он); иначе радиус игнорируется
type DistanceFn = (listing: Listing) => number | null;

// Временная фильтрация на клиенте — позже это будет запрос к API
export function filterListings(listings: Listing[], params: Params, distanceTo?: DistanceFn) {
  const num = (key: string) => {
    const value = params.get(key);
    return value ? Number(value) : null;
  };

  const eq = (key: string, value: string) => {
    const filter = params.get(key);
    return !filter || filter === value;
  };

  const collection = collections.find(
    (c) => c.slug === params.get("collection")
  );

  const priceFrom = num("priceFrom");
  const priceTo = num("priceTo");
  const yearFrom = num("yearFrom");
  const yearTo = num("yearTo");
  const mileageTo = num("mileageTo");
  const model = params.get("model")?.toLowerCase();
  const posted = postedPeriods[params.get("posted") as keyof typeof postedPeriods];
  const flag = (key: string) => params.get(key) === "1";
  const radius = distanceTo ? num("radius") : null;
  const within = (l: Listing) => {
    if (radius === null) return true;
    const km = distanceTo!(l);
    return km !== null && km <= radius;
  };

  const result = listings.filter(
    (l) =>
      (!collection || collection.matches(l)) &&
      eq("condition", l.condition) &&
      eq("brand", l.brand) &&
      (!model || l.title.toLowerCase().includes(model)) &&
      (priceFrom === null || l.price >= priceFrom) &&
      (priceTo === null || l.price <= priceTo) &&
      (yearFrom === null || l.year >= yearFrom) &&
      (yearTo === null || l.year <= yearTo) &&
      (mileageTo === null || l.mileage <= mileageTo) &&
      eq("bodyType", l.bodyType) &&
      eq("fuel", l.fuel) &&
      eq("transmission", l.transmission) &&
      eq("drive", l.drive) &&
      eq("sellerType", l.sellerType) &&
      eq("dealer", l.dealer ?? "") &&
      eq("color", l.color ?? "") &&
      (!posted || l.postedMinutesAgo <= posted) &&
      (!flag("withPhotos") || l.images.length > 0) &&
      (!flag("noAccidents") || Boolean(l.noAccidents)) &&
      (!flag("oneOwner") || l.owners === 1) &&
      (!flag("serviceBook") || Boolean(l.serviceBook)) &&
      within(l)
  );

  switch (params.get("sort")) {
    case "price_asc":
      return result.sort((a, b) => a.price - b.price);
    case "price_desc":
      return result.sort((a, b) => b.price - a.price);
    case "mileage_asc":
      return result.sort((a, b) => a.mileage - b.mileage);
    case "year_desc":
      return result.sort((a, b) => b.year - a.year);
    case "distance":
      return distanceTo ? result.sort((a, b) => (distanceTo(a) ?? 1e9) - (distanceTo(b) ?? 1e9)) : result;
    default:
      return result;
  }
}
