import { it, expect, describe } from "vitest";
import { testimonialSchema, portfolioPropertyWhere, publishedCaseWhere } from "../src/modules/portfolio.js";

describe("QA-017 testimonial captions and transcript", () => {
  it("defaults captions and transcript to empty strings", () => {
    const parsed = testimonialSchema.parse({ ownerName: "Ravi" });
    expect(parsed.captionsUrl).toBe("");
    expect(parsed.transcript).toBe("");
  });
  it("accepts an https captions file", () =>
    expect(
      testimonialSchema.parse({
        ownerName: "Ravi",
        captionsUrl: "https://cdn.example.com/captions.vtt",
      }).captionsUrl,
    ).toBe("https://cdn.example.com/captions.vtt"));
  it("rejects non-http captions URLs (javascript: vector)", () =>
    expect(() =>
      testimonialSchema.parse({
        ownerName: "Ravi",
        captionsUrl: "javascript:alert(1)",
      }),
    ).toThrow());
  it("caps transcripts at 5000 characters", () => {
    expect(
      testimonialSchema.parse({ ownerName: "Ravi", transcript: "t".repeat(5000) })
        .transcript,
    ).toHaveLength(5000);
    expect(() =>
      testimonialSchema.parse({ ownerName: "Ravi", transcript: "t".repeat(5001) }),
    ).toThrow();
  });
});

describe("QA-010/011 portfolio eligibility feeds the owner routes", () => {
  it("owner property lookups only consider published, opted-in, real inventory", () => {
    expect(portfolioPropertyWhere).toMatchObject({
      status: "PUBLISHED",
      portfolioEnabled: true,
      isDemo: false,
    });
  });
  it("case studies inherit the same eligibility when property-linked", () =>
    expect(publishedCaseWhere.OR).toEqual([
      { propertyId: null },
      { property: portfolioPropertyWhere },
    ]));
});