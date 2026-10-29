import { describe, expect, it } from "vitest";

import { withQuery } from "@/lib/url";
import { formatPrice, initials } from "@/lib/utils";

describe("withQuery", () => {
  const current = new URLSearchParams("brand=audi&page=3");
  it("sets and removes parameters, keeping the rest", () => {
    expect(withQuery("/cars", current, { page: null, fuel: "diesel" })).toBe("/cars?brand=audi&fuel=diesel");
  });
  it("returns the bare path when nothing is left", () => {
    expect(withQuery("/cars", current, { brand: null, page: "" })).toBe("/cars");
  });
  it("does not modify the current parameters", () => {
    withQuery("/cars", current, { brand: null });
    expect(current.get("brand")).toBe("audi");
  });
});

describe("formatting", () => {
  it("formats prices with grouping and the euro sign", () => {
    expect(formatPrice(12500).replace(/\s/g, " ")).toBe("12 500 €");
  });
  it("takes up to two initials", () => {
    expect(initials("Baltic Auto Group")).toBe("BA");
    expect(initials("kia")).toBe("K");
  });
});
