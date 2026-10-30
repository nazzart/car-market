import type { Listing } from "../types";

// Пробег в год — по нему видно, много или мало ездила машина для своего возраста.
// Средний пробег легковой машины в Латвии и Европе — около 15 000 km в год
export const AVERAGE_KM_PER_YEAR = 15_000;
const LOW = 10_000;
const HIGH = 22_000;

export type MileageLevel = "low" | "average" | "high";

// Километров в год, округлено до сотен. null — новая машина или пробег не указан: сравнивать не с чем
export function mileagePerYear(listing: Pick<Listing, "year" | "mileage" | "condition">, now = new Date()): number | null {
  if (listing.condition === "new" || listing.mileage <= 0) return null;
  const years = Math.max(1, now.getFullYear() - listing.year);
  return Math.round(listing.mileage / years / 100) * 100;
}

export const mileageLevel = (perYear: number): MileageLevel => (perYear < LOW ? "low" : perYear > HIGH ? "high" : "average");

// Сколько делений «указателя топлива» из 5 закрасить: каждое — 6 000 km в год, хотя бы одно
export const gaugeSegments = (perYear: number) => Math.min(5, Math.max(1, Math.ceil(perYear / 6_000)));
