import { describe, expect, it } from "vitest";

import { isPhone, telHref } from "@/lib/phone";
import { cleanText, isEmail, isListingId, isRegNumber, normalizeRegNumber, parseListingId } from "@/lib/validate";

describe("cleanText", () => {
  it("trims and limits length", () => {
    expect(cleanText("  Rīga  ")).toBe("Rīga");
    expect(cleanText("abcdef", 3)).toBe("abc");
  });
  it("turns non-strings into an empty string", () => {
    expect(cleanText(undefined)).toBe("");
    expect(cleanText(42)).toBe("");
    expect(cleanText({ toString: () => "x" })).toBe("");
  });
});

describe("isEmail", () => {
  it.each(["a@b.lv", " user.name+tag@mail.example.com "])("accepts %s", (value) => expect(isEmail(value)).toBe(true));
  it.each(["", "a@b", "a b@c.lv", "@b.lv", 5, null])("rejects %s", (value) => expect(isEmail(value)).toBe(false));
});

describe("listing ids", () => {
  it("accepts only digit strings", () => {
    expect(isListingId("42")).toBe(true);
    expect(isListingId("4a")).toBe(false);
    expect(isListingId(42)).toBe(false);
    expect(isListingId("1234567890123456")).toBe(false); // длиннее 15 цифр
  });
  it("parses or throws", () => {
    expect(parseListingId("7")).toBe(7);
    expect(() => parseListingId("drop table")).toThrow();
  });
});

describe("registration number", () => {
  it("allows spaces while typing, needs exactly 11 digits", () => {
    expect(isRegNumber("4000 3123 456")).toBe(true);
    expect(normalizeRegNumber("4000 3123 456")).toBe("40003123456");
    expect(isRegNumber("4000312345")).toBe(false);
    expect(isRegNumber("4000312345a")).toBe(false);
  });
});

describe("phone", () => {
  it.each(["+371 2000 3001", "+37120003001", "2000-3001"])("accepts %s", (value) => expect(isPhone(value)).toBe(true));
  it.each(["123", "+371 2000 abc", "1234567890123456"])("rejects %s", (value) => expect(isPhone(value)).toBe(false));
  it("builds a tel: link with digits only", () => expect(telHref("+371 2000-3001")).toBe("tel:+37120003001"));
});
