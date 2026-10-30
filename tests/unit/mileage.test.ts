import { describe, expect, it } from "vitest";

import { gaugeSegments, mileageLevel, mileagePerYear } from "@/features/cars/lib/mileage";

const now = new Date("2026-10-30");

describe("mileagePerYear", () => {
  it("divides by the car's age, rounded to hundreds", () => {
    expect(mileagePerYear({ year: 2020, mileage: 102_000, condition: "used" }, now)).toBe(17_000);
    expect(mileagePerYear({ year: 2016, mileage: 61_234, condition: "used" }, now)).toBe(6_100);
  });

  it("counts a car from this year as one year old", () => {
    expect(mileagePerYear({ year: 2026, mileage: 8_000, condition: "used" }, now)).toBe(8_000);
  });

  it("is not shown for new cars or without mileage", () => {
    expect(mileagePerYear({ year: 2026, mileage: 15, condition: "new" }, now)).toBeNull();
    expect(mileagePerYear({ year: 2018, mileage: 0, condition: "used" }, now)).toBeNull();
  });
});

describe("mileageLevel and gauge", () => {
  it("low under 10 000, high over 22 000 km a year", () => {
    expect(mileageLevel(6_100)).toBe("low");
    expect(mileageLevel(15_000)).toBe("average");
    expect(mileageLevel(30_000)).toBe("high");
  });

  it("fills 1–5 segments, 6 000 km each", () => {
    expect(gaugeSegments(500)).toBe(1);
    expect(gaugeSegments(12_000)).toBe(2);
    expect(gaugeSegments(17_000)).toBe(3);
    expect(gaugeSegments(90_000)).toBe(5);
  });
});
