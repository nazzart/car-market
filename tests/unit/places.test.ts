import { describe, expect, it } from "vitest";

import { distanceKm } from "@/lib/geo";
import { PLACES, findPlace, foldText, placeMatcher, placeName } from "@/lib/places";

describe("distanceKm", () => {
  it("is about 40 km from Rīga to Ogre", () => {
    const d = distanceKm(findPlace("riga")!, findPlace("ogre")!);
    expect(d).toBeGreaterThan(30);
    expect(d).toBeLessThan(45);
  });
  it("is zero for the same point", () => expect(distanceKm({ lat: 56.9, lng: 24.1 }, { lat: 56.9, lng: 24.1 })).toBe(0));
});

describe("placeMatcher", () => {
  it("a town matches only itself without a radius", () => {
    const inRiga = placeMatcher("riga");
    expect(inRiga("riga")).toBe(true);
    expect(inRiga("jurmala")).toBe(false);
  });
  it("a municipality includes its towns", () => {
    const inOgresNovads = placeMatcher("ogres-novads");
    const towns = PLACES.filter((p) => p.municipality === "ogres-novads").map((p) => p.key);
    expect(towns.length).toBeGreaterThan(0);
    for (const town of towns) expect(inOgresNovads(town)).toBe(true);
    expect(inOgresNovads("riga")).toBe(false);
  });
  it("a radius adds nearby places", () => {
    expect(placeMatcher("riga", 30)("jurmala")).toBe(true);
    expect(placeMatcher("riga", 30)("liepaja")).toBe(false);
  });
  it("an unknown key matches only itself", () => {
    const m = placeMatcher("some-village");
    expect(m("some-village")).toBe(true);
    expect(m("riga")).toBe(false);
  });
});

describe("names", () => {
  it("translates known places and keeps unknown ones", () => {
    expect(placeName("riga", "ru")).toBe("Рига");
    expect(placeName("riga", "lv")).toBe("Rīga");
    expect(placeName("Ādaži-centrs", "lv")).toBe("Ādaži-centrs");
  });
  it("folds diacritics and case", () => expect(foldText(" Ķekava ")).toBe("kekava"));
  it("has unique keys", () => expect(new Set(PLACES.map((p) => p.key)).size).toBe(PLACES.length));
});
