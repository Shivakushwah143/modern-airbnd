import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import {
  teamSchema,
  testimonialSchema,
  caseSchema,
  visibilitySchema,
  signatureInput,
  slugify,
} from "../src/modules/portfolio.js";
import { cmsPageInput, cmsSlug } from "../src/modules/cms.js";

describe("portfolio validation", () => {
  it("rejects a team member without a name", () => {
    expect(() => teamSchema.parse({ name: "   " })).toThrow(ZodError);
  });

  it("trims names and applies safe defaults", () => {
    const parsed = teamSchema.parse({ name: "  Asha  " });
    expect(parsed.name).toBe("Asha");
    expect(parsed.isPublished).toBe(false);
    expect(parsed.sortOrder).toBe(0);
    expect(parsed.photoUrl).toBe("");
  });

  it("accepts only IMAGE or VIDEO testimonials", () => {
    const parsed = testimonialSchema.parse({
      ownerName: "Ravi",
      mediaUrl: "https://cdn.example.com/shot.jpg",
    });
    expect(parsed.mediaType).toBe("IMAGE");
    expect(() =>
      testimonialSchema.parse({ ownerName: "Ravi", mediaType: "GIF" }),
    ).toThrow(ZodError);
  });

  it("rejects non-http media URLs", () => {
    expect(() =>
      testimonialSchema.parse({
        ownerName: "Ravi",
        mediaUrl: "javascript:alert(1)",
      }),
    ).toThrow(ZodError);
    expect(() =>
      testimonialSchema.parse({ ownerName: "Ravi", mediaUrl: "ftp://x/y" }),
    ).toThrow(ZodError);
  });

  it("constrains sort order to a sane range", () => {
    expect(() =>
      teamSchema.parse({ name: "A", sortOrder: -1 }),
    ).toThrow(ZodError);
    expect(() =>
      teamSchema.parse({ name: "A", sortOrder: 100000 }),
    ).toThrow(ZodError);
  });

  it("requires a uuid when linking a case study to a property", () => {
    expect(() =>
      caseSchema.parse({ title: "T", propertyId: "nope" }),
    ).toThrow(ZodError);
    expect(
      caseSchema.parse({ title: "T", propertyId: null }).propertyId,
    ).toBeNull();
  });

  it("requires at least one field when changing visibility", () => {
    expect(() => visibilitySchema.parse({})).toThrow(ZodError);
    expect(
      visibilitySchema.parse({ guestEnabled: false }).guestEnabled,
    ).toBe(false);
    expect(() =>
      visibilitySchema.parse({ adminEnabled: true }),
    ).toThrow(ZodError);
  });

  it("restricts upload signatures to known slots, kinds and no extras", () => {
    expect(signatureInput.parse({ slot: "team", kind: "image" })).toEqual({
      slot: "team",
      kind: "image",
    });
    expect(() =>
      signatureInput.parse({ slot: "properties", kind: "image" }),
    ).toThrow(ZodError);
    expect(() =>
      signatureInput.parse({ slot: "team", kind: "gif" }),
    ).toThrow(ZodError);
    expect(() =>
      signatureInput.parse({ slot: "team", kind: "image", extra: 1 }),
    ).toThrow(ZodError);
  });

  it("slugifies case-study titles deterministically", () => {
    expect(slugify("  Goa Villa! 2026 ")).toBe("goa-villa-2026");
    expect(slugify("***")).toBe("item");
  });
});

describe("cms validation", () => {
  it("accepts URL-safe slugs only", () => {
    expect(cmsSlug.parse("summer-offers")).toBe("summer-offers");
    expect(() => cmsSlug.parse("Summer Offers")).toThrow(ZodError);
    expect(() => cmsSlug.parse("../secret")).toThrow(ZodError);
    expect(() => cmsSlug.parse("a".repeat(81))).toThrow(ZodError);
  });

  it("requires a title and defaults publishing to false", () => {
    const parsed = cmsPageInput.parse({ slug: "faq", title: "  FAQ  " });
    expect(parsed.title).toBe("FAQ");
    expect(parsed.isPublished).toBe(false);
    expect(() =>
      cmsPageInput.parse({ slug: "faq", title: " " }),
    ).toThrow(ZodError);
  });

  it("caps body and SEO field lengths", () => {
    expect(() =>
      cmsPageInput.parse({ slug: "faq", title: "F", body: "x".repeat(20001) }),
    ).toThrow(ZodError);
    expect(() =>
      cmsPageInput.parse({
        slug: "faq",
        title: "F",
        seoDescription: "x".repeat(301),
      }),
    ).toThrow(ZodError);
  });
});