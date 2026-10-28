import type { Listing } from "./listings";

// «Новое»: размещено за последние сутки
export const FRESH_MINUTES = 24 * 60;

export const isFresh = (listing: Listing) => listing.postedMinutesAgo < FRESH_MINUTES;
