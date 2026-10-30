import { describe, expect, it } from "vitest";

import {
  listingTitle,
  modelEntryMatches,
  normalizeVersion,
  searchTitle,
  versionGroup,
  versionGroupPattern,
  versionGroupsOf,
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

const BMW_5 = ["520d", "530d", "530d xDrive", "530e", "530e xDrive", "530i", "M550i xDrive"];
const MB_E = ["E 200", "E 220 CDI", "E 220 d", "E 300 e"];

describe("normalizeVersion", () => {
  it("uses the catalogue spelling when it matches", () => {
    expect(normalizeVersion("530 D", BMW_5)).toBe("530d");
    expect(normalizeVersion("530E XDRIVE", BMW_5)).toBe("530e xDrive");
    expect(normalizeVersion("e220cdi", MB_E)).toBe("E 220 CDI");
  });

  it("tidies versions that are not in the catalogue", () => {
    expect(normalizeVersion("  530D   xdrive  touring ", BMW_5)).toBe("530d xDrive touring");
    expect(normalizeVersion("45 tdi quattro")).toBe("45 TDI quattro");
    expect(normalizeVersion("   ")).toBe("");
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
    expect(versionGroupsOf(BMW_5)).toEqual(["520", "530", "M550"]);
    expect(versionGroupsOf(MB_E)).toEqual(["E 200", "E 220", "E 300"]);
  });

  it("finds a version group by the group, the model or a full version", () => {
    const entry = { model: "5 Series", version: "530" };
    expect(modelEntryMatches(entry, "530", BMW_5)).toBe(true);
    expect(modelEntryMatches(entry, "530d", BMW_5)).toBe(true);
    expect(modelEntryMatches(entry, "5 ser", BMW_5)).toBe(true);
    expect(modelEntryMatches(entry, "540", BMW_5)).toBe(false);
    expect(modelEntryMatches({ model: "5 Series" }, "530", BMW_5)).toBe(false);
    expect(modelEntryMatches({ model: "CL", version: "CL 500" }, "cl 500", ["CL 500", "CL 600"])).toBe(true);
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
