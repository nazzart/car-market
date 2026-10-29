import { describe, expect, it } from "vitest";

import { isFresh } from "@/features/cars/lib/isFresh";
import { collections } from "@/features/collections/config";
import { isListed, isProfileComplete } from "@/features/dealers/lib/listed";
import { getOpenStatus } from "@/features/dealers/lib/openStatus";
import { riskFlags } from "@/features/moderation/riskFlags";
import { inCollection, isPublic } from "@/features/moderation/visibility";

import { makeListing } from "./fixtures";

describe("isPublic (same rule as published in SQL)", () => {
  it("shows an active listing", () => expect(isPublic(makeListing())).toBe(true));
  it.each([
    ["hidden by the seller", { status: "paused" as const }],
    ["sold", { status: "sold" as const }],
    ["waiting for review", { review: "pending" as const }],
    ["blocked by a moderator", { moderation: { status: "blocked" as const, reason: "fraud" as const, at: 0 } }],
    ["seller account blocked", { accountBlock: { reason: "fraud" as const, at: 0 } }],
  ])("hides a listing that is %s", (_, overrides) => expect(isPublic(makeListing(overrides))).toBe(false));
});

describe("collections", () => {
  const retro = collections.find((c) => c.slug === "retro")!;
  it("follow their rule", () => {
    expect(retro.matches(makeListing({ year: 1990 }))).toBe(true);
    expect(retro.matches(makeListing({ year: 2010 }))).toBe(false);
  });
  it("respect a moderator's exclusion", () => {
    expect(inCollection(makeListing({ year: 1990 }), retro)).toBe(true);
    expect(inCollection(makeListing({ year: 1990, excludedCollections: ["retro"] }), retro)).toBe(false);
  });
});

describe("dealer listing rule", () => {
  it("needs an address and a phone, and no block", () => {
    expect(isProfileComplete({ address: "Brīvības iela 1", phone: "+371 2000 0000" })).toBe(true);
    expect(isProfileComplete({ address: " ", phone: "+371 2000 0000" })).toBe(false);
    expect(isListed({ address: "Brīvības iela 1", phone: "+371 2000 0000", blocked: { reason: "fraud", at: 0 } })).toBe(false);
  });
});

describe("opening hours (Riga time)", () => {
  const hours = { mon: { open: "09:00", close: "18:00" } };
  // 2026-11-02 — понедельник; Рига зимой UTC+2
  const at = (utc: string) => Date.parse(`2026-11-02T${utc}:00Z`);
  it("is open during the day", () => expect(getOpenStatus(hours, at("10:00"))).toEqual({ open: true, until: "18:00" }));
  it("opens later today in the morning", () => {
    expect(getOpenStatus(hours, at("05:00"))).toMatchObject({ open: false, next: { day: "mon", time: "09:00", inDays: 0 } });
  });
  it("is closed after closing time", () => expect(getOpenStatus(hours, at("17:00")).open).toBe(false));
});

describe("fresh badge", () => {
  it("lasts one day", () => {
    expect(isFresh(makeListing({ postedMinutesAgo: 60 }))).toBe(true);
    expect(isFresh(makeListing({ postedMinutesAgo: 24 * 60 + 1 }))).toBe(false);
  });
});

describe("risk flags", () => {
  it("flags contacts in the description and missing photos", () => {
    const flags = riskFlags(makeListing({ description: "Zvaniet +371 2000 1234", images: [] }), []);
    expect(flags).toEqual(expect.arrayContaining(["contactInText", "noPhotos"]));
  });
  it("flags a duplicate and a price far below similar cars", () => {
    const similar = [makeListing({ id: "2", price: 20000 }), makeListing({ id: "3", price: 22000 })];
    const listing = makeListing({ id: "4", title: "Other", price: 5000 });
    expect(riskFlags(listing, similar)).toContain("priceLow");
    expect(riskFlags(makeListing({ id: "5" }), [makeListing({ id: "6" })])).toContain("duplicate");
  });
  it("does not flag an ordinary listing from a known seller", () => {
    expect(riskFlags(makeListing({ sellerType: "dealer", year: 2010, price: 6000 }), [])).toEqual([]);
  });
});

describe("contact detection in descriptions", () => {
  it.each(["+371 2000 1234", "2000 1234", "20 001 234", "20001234", "2000-1234", "info@salons.lv", "www.salons.lv", "WhatsApp"])(
    "catches %s",
    (text) => expect(riskFlags(makeListing({ description: `Sazinieties: ${text}` }), [])).toContain("contactInText")
  );
  it.each(["Nobraukums 120 000 km", "Gads 2018, jauda 110 ZS", "Cena 12 500 €"])("ignores %s", (text) =>
    expect(riskFlags(makeListing({ description: text }), [])).not.toContain("contactInText")
  );
});
