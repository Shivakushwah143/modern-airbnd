import { describe, it, expect } from "vitest";
import {
  overlaps,
  availability,
  dateSchema,
  searchSchema,
} from "../src/lib/dates.js";
import { whatsapp } from "../src/lib/whatsapp.js";
describe("Half-open stay intervals", () => {
  for (const [label, start, end, expected] of [
    ["exact", "2099-01-12", "2099-01-15", true],
    ["left overlap", "2099-01-10", "2099-01-13", true],
    ["right overlap", "2099-01-14", "2099-01-18", true],
    ["contains block", "2099-01-10", "2099-01-18", true],
    ["inside block", "2099-01-13", "2099-01-14", true],
    ["adjacent before", "2099-01-10", "2099-01-12", false],
    ["adjacent after", "2099-01-15", "2099-01-18", false],
    ["separate", "2099-02-01", "2099-02-03", false],
  ] as const)
    it(label, () =>
      expect(overlaps(start, end, "2099-01-12", "2099-01-15")).toBe(expected),
    );
  it("one free unit is enough", () =>
    expect(
      availability([{ id: "a" }, { id: "b" }], new Set(["a"]), true),
    ).toEqual({ status: "AVAILABLE", availableUnits: 1 }));
  it("all units blocked is unavailable", () =>
    expect(availability([{ id: "a" }], new Set(["a"]), true).status).toBe(
      "UNAVAILABLE",
    ));
  it("zero units is unavailable", () =>
    expect(availability([], new Set(), true).status).toBe("UNAVAILABLE"));
  it("no dates never claims available", () =>
    expect(availability([{ id: "a" }], new Set(), false)).toEqual({
      status: "NOT_EVALUATED",
    }));
  it("rejects impossible dates", () =>
    expect(dateSchema.safeParse("2099-02-30").success).toBe(false));
  it("rejects partial dates", () =>
    expect(searchSchema.safeParse({ checkIn: "2099-01-01" }).success).toBe(
      false,
    ));
  it("rejects equal dates", () =>
    expect(
      searchSchema.safeParse({ checkIn: "2099-01-01", checkOut: "2099-01-01" })
        .success,
    ).toBe(false));
  it("rejects past dates", () =>
    expect(
      searchSchema.safeParse({ checkIn: "2000-01-01", checkOut: "2000-01-03" })
        .success,
    ).toBe(false));
});
describe("WhatsApp handoff", () => {
  const base = {
    name: "A & B apartment",
    location: "Delhi",
    url: "https://modern.test/properties/a",
    fallback: "+919876543210",
  };
  it("encodes name and dates", () => {
    const u = new URL(
      whatsapp({ ...base, checkIn: "2099-01-01", checkOut: "2099-01-03" })!,
    );
    expect(u.searchParams.get("text")).toContain("A & B apartment");
    expect(u.searchParams.get("text")).toContain("2099-01-01 to 2099-01-03");
  });
  it("omits unknown dates", () =>
    expect(decodeURIComponent(whatsapp(base)!)).not.toContain("undefined"));
  it("uses property contact before global fallback", () =>
    expect(whatsapp({ ...base, number: "+919111111111" })).toContain(
      "wa.me/919111111111",
    ));
  it("does not create a broken contact link", () =>
    expect(whatsapp({ ...base, fallback: "" })).toBeNull());
  it("unavailable message asks for alternatives", () =>
    expect(
      decodeURIComponent(whatsapp({ ...base, unavailable: true })!),
    ).toContain("alternative dates"));
});
