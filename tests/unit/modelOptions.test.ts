import { describe, expect, it } from "vitest";

import { matchesQuery } from "@/components/ui/SearchSelect";
import { modelOptions, modelValue, parseModelValue } from "@/features/cars/lib/modelOptions";
import type { FilterModel } from "@/features/cars/types";

const bmw: FilterModel[] = [
  { name: "3 Series", versions: [{ value: "320", count: 4 }], catalogVersions: ["320d", "320i"] },
  {
    name: "5 Series",
    versions: [{ value: "530", count: 3 }, { value: "540", count: 2 }],
    catalogVersions: ["520d", "530", "530d", "530d xDrive", "530e"],
  },
];
const counts: Record<string, number> = { "3 Series": 4, "5 Series": 5 };

describe("modelOptions", () => {
  const options = modelOptions(bmw, (m) => counts[m]);

  it("lists models with version groups, exact catalogue versions only for search", () => {
    const visible = options.filter((o) => !o.searchOnly).map((o) => o.value);
    expect(visible).toEqual(["3 Series", "3 Series|320", "5 Series", "5 Series|530", "5 Series|540"]);
    expect(options.find((o) => o.value === "5 Series|530d")).toMatchObject({ searchOnly: true, fullLabel: "5 Series · 530d" });
  });

  it("does not repeat a catalogue version that is already a group", () => {
    expect(options.filter((o) => o.value === "5 Series|530")).toHaveLength(1);
  });

  it("typing 530d finds 530d and 530d xDrive, not the 530 group", () => {
    const found = options.filter((o) => matchesQuery(o, "530d")).map((o) => o.value);
    expect(found).toEqual(["5 Series|530d", "5 Series|530d xDrive"]);
  });

  it("finds a model by name with its versions", () => {
    expect(options.filter((o) => matchesQuery(o, "3 series")).map((o) => o.value)).toContain("3 Series");
  });

  it("keeps a selected version from the URL that is not in the list", () => {
    const withSelected = modelOptions(bmw, (m) => counts[m], "5 Series|530xd");
    expect(withSelected.find((o) => o.value === "5 Series|530xd")).toMatchObject({ indent: true });
    expect(withSelected.find((o) => o.value === "5 Series|530xd")?.searchOnly).toBeUndefined();
  });

  it("encodes model and version as one value", () => {
    expect(modelValue("5 Series", "530d")).toBe("5 Series|530d");
    expect(modelValue("5 Series")).toBe("5 Series");
    expect(parseModelValue("5 Series|530d")).toEqual({ model: "5 Series", version: "530d" });
    expect(parseModelValue("")).toEqual({ model: "", version: "" });
  });
});
