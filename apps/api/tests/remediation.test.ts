import { it, expect } from "vitest";
import { eligibleUnits, inventoryErrors } from "../src/modules/inventory.js";
import { stayAction } from "../../web/lib/cta.js";
const whole = { id: "whole", isActive: true, isEntireProperty: true };
const room = { id: "room", isActive: true, isEntireProperty: false };
it("entire-property mode selects only its whole-property unit", () =>
  expect(
    eligibleUnits({ inventoryMode: "ENTIRE_PROPERTY", units: [whole, room] }),
  ).toEqual([whole]));
it("multi-unit mode cannot count synthetic inventory", () =>
  expect(
    eligibleUnits({ inventoryMode: "MULTI_UNIT", units: [whole, room] }),
  ).toEqual([room]));
it("mixed inventory cannot pass publication", () =>
  expect(
    inventoryErrors({ inventoryMode: "ENTIRE_PROPERTY", units: [whole, room] }),
  ).not.toHaveLength(0));
it("review-required legacy inventory cannot pass publication", () =>
  expect(
    inventoryErrors({
      inventoryMode: "MULTI_UNIT",
      inventoryReviewRequired: true,
      units: [room],
    }),
  ).not.toHaveLength(0));
for (const [status, label] of [
  ["NOT_EVALUATED", "Check Availability"],
  ["AVAILABLE", "Enquire on WhatsApp"],
  ["UNAVAILABLE", "Change Dates"],
  ["UNKNOWN", "Retry Availability"],
] as const)
  it(`CTA ${status}`, () => expect(stayAction(status).label).toBe(label));
