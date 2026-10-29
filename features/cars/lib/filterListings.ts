import { Collection, collections } from "@/features/collections/config";

import { placeMatcher } from "@/lib/places";

import type { Listing } from "../types";
import { postedPeriods } from "../config/filterOptions";

export type Params = { get: (key: string) => string | null };

type Options = {
  // попадание в подборку с учётом модерации; по умолчанию — правило подборки
  inCollection?: (listing: Listing, collection: Collection) => boolean;
};

// Временная фильтрация на клиенте — позже это будет запрос к API
export function filterListings(listings: Listing[], params: Params, { inCollection }: Options = {}) {
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
  // место: город или край (край — со своими городами), area — плюс окрестности в км
  const place = params.get("place");
  const inPlace = place ? placeMatcher(place, num("area") ?? 0) : null;
  const powerFrom = num("powerFrom");
  const powerTo = num("powerTo");
  const latvia = params.get("latvia");

  // техосмотр «MM.YYYY» действует, если не раньше текущего месяца
  const now = new Date();
  const thisMonth = now.getFullYear() * 100 + now.getMonth() + 1;
  const inspectionValid = (date?: string) => {
    if (!date) return false;
    const [month, year] = date.split(".").map(Number);
    return year * 100 + month >= thisMonth;
  };

  const result = listings.filter(
    (l) =>
      (!collection || (inCollection ? inCollection(l, collection) : collection.matches(l))) &&
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
      (!flag("recentService") || l.service === "recent") &&
      (!flag("goodCondition") || l.overallCondition === "excellent" || l.overallCondition === "good") &&
      (!flag("inspectionValid") || inspectionValid(l.inspectionUntil)) &&
      (!latvia || (latvia === "imported" ? l.mileageLatvia === "none" : Boolean(l.mileageLatvia) && l.mileageLatvia !== "none")) &&
      (powerFrom === null || l.power >= powerFrom) &&
      (powerTo === null || l.power <= powerTo) &&
      (!inPlace || inPlace(l.city))
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
    default:
      return result;
  }
}
