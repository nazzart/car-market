import { describe, expect, it } from "vitest";

import { parseListing } from "@/features/sell-vehicle/lib/parseListing";

const prefix = "https://photos.example/listings/user-1/";
const photo = (n: number) => `${prefix}${String(n).padStart(8, "0")}-0000-4000-8000-000000000000.jpg`;
const now = new Date("2026-10-30");

const valid = {
  brand: "bmw",
  model: "5 Series",
  version: "530d",
  year: "2019",
  mileage: "120000",
  price: "23900",
  negotiable: "yes",
  bodyType: "sedan",
  color: "black",
  fuel: "diesel",
  engineCapacity: "3.0",
  power: "265",
  transmission: "automatic",
  drive: "awd",
  vin: "",
  owners: "4+",
  mileageLatvia: "unknown",
  inspectionUntil: "2027-05",
  condition: "good",
  hadAccident: "no",
  hasServiceDone: "recent",
  hasServiceBook: "yes",
  damages: { hood: ["scratch", "bogus"], spoiler: ["dent"] },
  comfort: ["climate", "not-a-key"],
  safety: [],
  description: "  Labā stāvoklī  ",
  videoUrl: "",
  sellerPhone: "+371 2000 1234",
  sellerCity: "riga",
  contactId: "c-1",
  photos: [photo(1), photo(2)],
};

const parse = (changes: Record<string, unknown> = {}, isDealer = false) =>
  parseListing({ ...valid, ...changes }, { isDealer, photoPrefix: prefix, now });

describe("parseListing", () => {
  it("turns form values into listing columns", () => {
    const result = parse();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toMatchObject({
      year: 2019,
      mileage: 120000,
      price: 23900,
      negotiable: true,
      engine: 3,
      power: 265,
      owners: 4,
      mileageLatvia: null, // «не знаю»
      inspectionUntil: "05.2027",
      overallCondition: "good",
      noAccidents: true,
      service: "recent",
      serviceBook: true,
      damages: { hood: ["scratch"] },
      equipment: ["climate"],
      description: "Labā stāvoklī",
      phone: "+371 2000 1234",
      city: "riga",
      contactId: null, // частное лицо — без контактного лица
      leasingMonthly: null,
      images: [photo(1), photo(2)],
    });
  });

  it("lists every invalid required field", () => {
    const result = parse({ year: "1800", price: "abc", fuel: "steam", sellerPhone: "123", description: " " });
    expect(result).toEqual({ ok: false, fields: ["year", "price", "fuel", "description", "sellerPhone"] });
  });

  it("accepts no inspection, rejects a broken one", () => {
    expect(parse({ inspectionUntil: "none" }).ok).toBe(true);
    expect(parse({ inspectionUntil: "soon" })).toMatchObject({ ok: false, fields: ["inspectionUntil"] });
  });

  it("electric cars need no engine size", () => {
    const result = parse({ fuel: "electric", engineCapacity: "" });
    expect(result.ok && result.value.engine).toBeNull();
    expect(parse({ engineCapacity: "" })).toMatchObject({ ok: false, fields: ["engineCapacity"] });
  });

  it("leasing and contact person only for dealers", () => {
    const leasing = { leasingMonthly: "350", leasingDownPayment: "20", leasingMonths: "60" };
    const asPrivate = parse(leasing);
    expect(asPrivate.ok && asPrivate.value.leasingMonthly).toBeNull();

    const asDealer = parse({ ...leasing, sellerPhone: "", sellerCity: "Ādaži centrs" }, true);
    expect(asDealer.ok && asDealer.value).toMatchObject({
      leasingMonthly: 350,
      leasingDownPayment: 20,
      leasingMonths: 60,
      phone: null, // телефон дилера — из профиля
      contactId: "c-1",
      city: "Ādaži centrs",
    });
    expect(parse({ leasingMonthly: "350", leasingMonths: "200" }, true)).toMatchObject({ ok: false, fields: ["leasingMonths"] });
  });

  it("accepts only the user's own uploaded photos, up to 20", () => {
    expect(parse({ photos: ["https://evil.example/x.jpg"] })).toMatchObject({ ok: false, fields: ["photos"] });
    expect(parse({ photos: [`${prefix}../other-user/a.jpg`] })).toMatchObject({ ok: false, fields: ["photos"] });
    expect(parse({ photos: Array.from({ length: 21 }, (_, i) => photo(i)) })).toMatchObject({ ok: false, fields: ["photos"] });
    expect(parse({ photos: [] }).ok).toBe(true);
  });

  it("checks VIN and video when given", () => {
    expect(parse({ vin: "wba4j710x0bt12345" }).ok).toBe(true);
    expect(parse({ vin: "SHORT" })).toMatchObject({ ok: false, fields: ["vin"] });
    expect(parse({ videoUrl: "https://example.com/v" })).toMatchObject({ ok: false, fields: ["videoUrl"] });
  });
});
