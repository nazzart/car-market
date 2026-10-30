import { describe, expect, it } from "vitest";

import {
  catalogVersionGroups,
  listingTitle,
  modelEntryMatches,
  normalizeVersion,
  searchTitle,
  versionGroup,
  versionGroupPattern,
} from "@/features/cars/lib/version";

describe("listingTitle", () => {
  it.each([
    ["BMW", "5 Series", "530d", "BMW 530d"],
    ["BMW", "5 Series", "M550i xDrive", "BMW M550i xDrive"],
    ["BMW", "5 Series", "530d xDrive Touring", "BMW 530d xDrive Touring"],
    ["BMW", "X5", "xDrive30d", "BMW X5 xDrive30d"],
    ["Mercedes-Benz", "CL", "CL 500", "Mercedes-Benz CL 500"],
    ["Mercedes-Benz", "CLA", "CLA 180 d", "Mercedes-Benz CLA 180 d"],
    ["Mercedes-Benz", "E-Class", "E 220 d", "Mercedes-Benz E 220 d"],
    ["Mercedes-Benz", "AMG GT", "AMG GT 43", "Mercedes-Benz AMG GT 43"],
    ["Audi", "A6", "45 TDI Avant", "Audi A6 45 TDI Avant"],
    ["Volkswagen", "Golf", "", "Volkswagen Golf"],
    ["Volkswagen", "Golf", undefined, "Volkswagen Golf"],
  ])("%s %s + %s → %s", (brand, model, version, title) => {
    expect(listingTitle(brand, model, version)).toBe(title);
  });

  it("keeps the model when the version does not name it", () => {
    // «CLA 180» начинается с «CL», но это другая модель
    expect(listingTitle("Mercedes-Benz", "CL", "CLA 180")).toBe("Mercedes-Benz CL CLA 180");
  });
});

describe("normalizeVersion", () => {
  it("uses the catalogue spelling when it matches", () => {
    expect(normalizeVersion("bmw", "5 Series", "530 D")).toBe("530d");
    expect(normalizeVersion("bmw", "5 Series", "530E XDRIVE")).toBe("530e xDrive");
    expect(normalizeVersion("mercedes", "E-Class", "e220cdi")).toBe("E 220 CDI");
  });

  it("tidies versions that are not in the catalogue", () => {
    expect(normalizeVersion("bmw", "5 Series", "  530D   xdrive  touring ")).toBe("530d xDrive touring");
    expect(normalizeVersion("audi", "A6", "45 tdi quattro")).toBe("45 TDI quattro");
    expect(normalizeVersion("audi", "A6", "   ")).toBe("");
  });
});

describe("versionGroup", () => {
  it.each([
    ["530d xDrive Touring", "530"],
    ["530e", "530"],
    ["M550i xDrive", "M550"],
    ["xDrive30d M Sport", "xDrive30"],
    ["M50d", "M50"],
    ["E 220 CDI", "E 220"],
    ["E 220 d 4MATIC", "E 220"],
    ["CL 500", "CL 500"],
    ["AMG GT 43", "AMG GT 43"],
    ["45 TDI Avant", "45 TDI"],
    ["GTI Performance", "GTI"],
  ])("%s → %s", (version, group) => {
    expect(versionGroup(version)).toBe(group);
  });
});

describe("versionGroupPattern", () => {
  const matches = (group: string, version: string) => new RegExp(versionGroupPattern(group)).test(version.toLowerCase());

  it("matches every version of the group", () => {
    expect(matches("530", "530d")).toBe(true);
    expect(matches("530", "530e xDrive")).toBe(true);
    expect(matches("530", "530")).toBe(true);
    expect(matches("E 220", "E 220 CDI")).toBe(true);
    expect(matches("530d", "530d xDrive")).toBe(true);
  });

  it("does not match a longer number or another version", () => {
    expect(matches("530", "5300")).toBe(false);
    expect(matches("530", "535d")).toBe(false);
    expect(matches("E 220", "E 2200")).toBe(false);
    expect(matches("530d", "530de")).toBe(false);
  });
});

describe("model list with version groups", () => {
  it("groups catalogue versions of a model", () => {
    const groups = catalogVersionGroups("bmw", "5 Series");
    expect(groups).toContain("530");
    expect(groups).toContain("M550");
    expect(groups).not.toContain("530d");
  });

  it("finds a version group by the group, the model or a full version", () => {
    const entry = { model: "5 Series", version: "530" };
    expect(modelEntryMatches("bmw", entry, "530")).toBe(true);
    expect(modelEntryMatches("bmw", entry, "530d")).toBe(true);
    expect(modelEntryMatches("bmw", entry, "5 ser")).toBe(true);
    expect(modelEntryMatches("bmw", entry, "540")).toBe(false);
    expect(modelEntryMatches("bmw", { model: "5 Series" }, "530")).toBe(false);
    expect(modelEntryMatches("mercedes", { model: "CL", version: "CL 500" }, "cl 500")).toBe(true);
  });
});

describe("searchTitle", () => {
  it("names the search by brand, model and versions", () => {
    expect(searchTitle("BMW", null, null)).toBe("BMW");
    expect(searchTitle("BMW", "5 Series", null)).toBe("BMW 5 Series");
    expect(searchTitle("BMW", "5 Series", "530,540")).toBe("BMW 530, 540");
    expect(searchTitle("BMW", null, "530")).toBe("BMW 530");
    expect(searchTitle("BMW", "X5", "xDrive30")).toBe("BMW X5 xDrive30");
  });
});
