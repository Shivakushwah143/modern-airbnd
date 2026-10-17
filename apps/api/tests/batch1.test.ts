import { it, expect, describe } from "vitest";
import {
  portfolioPropertyWhere,
  publishedCaseWhere,
  testimonialPublishErrors,
} from "../src/modules/portfolio.js";
import { guestEligibilityErrors } from "../src/modules/enquiries.js";
import {
  publicPropertyDetail,
  type PublicPropertyRow,
} from "../src/modules/properties.js";

describe("QA-001 portfolio visibility", () => {
  it("does NOT require guestEnabled (owner-portfolio-only listings stay visible)", () => {
    expect(portfolioPropertyWhere).not.toHaveProperty("guestEnabled");
  });

  it("requires published, portfolio-enabled, real inventory at an active location", () => {
    expect(portfolioPropertyWhere.status).toBe("PUBLISHED");
    expect(portfolioPropertyWhere.portfolioEnabled).toBe(true);
    // QA-002: demo records are excluded from all public managed counts/lists.
    expect(portfolioPropertyWhere.isDemo).toBe(false);
    expect(portfolioPropertyWhere.location).toEqual({ isActive: true });
  });

  it("case studies without a property link stay visible; linked ones obey eligibility", () => {
    expect(publishedCaseWhere.isPublished).toBe(true);
    expect(publishedCaseWhere.OR).toEqual([
      { propertyId: null },
      { property: portfolioPropertyWhere },
    ]);
  });
});

describe("QA-004 testimonial consent gate", () => {
  const consented = {
    mediaUrl: "https://cdn.example.com/shot.jpg",
    consentConfirmed: true,
    consentSource: "WhatsApp approval from the owner",
    isPublished: true,
  };
  it("refuses publishing without attached media", () =>
    expect(
      testimonialPublishErrors({ ...consented, mediaUrl: "   " }),
    ).not.toHaveLength(0));
  it("refuses publishing without explicit owner consent", () =>
    expect(
      testimonialPublishErrors({ ...consented, consentConfirmed: false }),
    ).not.toHaveLength(0));
  it("refuses publishing when consent source is missing", () =>
    expect(
      testimonialPublishErrors({ ...consented, consentSource: "" }),
    ).not.toHaveLength(0));
  it("accepts a consented testimonial with media", () =>
    expect(testimonialPublishErrors(consented)).toHaveLength(0));
  it("drafts are never blocked by the publish gate", () =>
    expect(
      testimonialPublishErrors({
        mediaUrl: "",
        consentConfirmed: false,
        consentSource: "",
        isPublished: false,
      }),
    ).toHaveLength(0));
});

describe("QA-005 guest enquiry eligibility", () => {
  const good = {
    status: "PUBLISHED",
    guestEnabled: true,
    isDemo: false,
    location: { isActive: true },
  };
  it("accepts a published guest-enabled property at an active location", () =>
    expect(guestEligibilityErrors(good)).toHaveLength(0));
  it("rejects hidden (guest-disabled) properties", () =>
    expect(
      guestEligibilityErrors({ ...good, guestEnabled: false }),
    ).not.toHaveLength(0));
  it("rejects unpublished properties", () =>
    expect(
      guestEligibilityErrors({ ...good, status: "DRAFT" }),
    ).not.toHaveLength(0));
  it("rejects inactive locations", () =>
    expect(
      guestEligibilityErrors({ ...good, location: { isActive: false } }),
    ).not.toHaveLength(0));
});

describe("QA-003 public detail DTO allowlist", () => {
  const row = {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Marker apartment",
    slug: "marker-apartment",
    locationId: "00000000-0000-4000-8000-000000000002",
    location: {
      id: "00000000-0000-4000-8000-000000000002",
      name: "Test City",
      slug: "test-city",
      state: "TS",
      country: "India",
      isActive: true,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    },
    ownerId: "00000000-0000-4000-8000-000000000003",
    owner: {
      id: "00000000-0000-4000-8000-000000000003",
      name: "Owner",
      phone: "+919000000001",
      email: "owner@example.invalid",
      notes: "OWNER_INTERNAL_MARKER_PRIVATE",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    },
    shortDescription: "short",
    description: "A public description of the space for guests.",
    propertyType: "Entire apartment",
    inventoryMode: "ENTIRE_PROPERTY",
    inventoryReviewRequired: false,
    localHighlights: [],
    suitedFor: [],
    area: "Area",
    addressLine: "Street 1",
    latitude: null,
    longitude: null,
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    maxGuests: 2,
    whatsappNumber: "+919000000002",
    houseRules: ["No smoking"],
    checkInInfo: "after 2 pm",
    checkOutInfo: "before 11 am",
    propertyNotes: "PROPERTY_INTERNAL_MARKER_DO_NOT_LEAK",
    seoTitle: "",
    seoDescription: "",
    status: "PUBLISHED",
    isDemo: false,
    publishedAt: new Date("2026-01-02"),
    archivedAt: null,
    guestEnabled: true,
    portfolioEnabled: false,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-03"),
    units: [{ id: "unit-1", name: "Entire Property" }],
    media: [],
    amenities: [],
    externalListings: [
      {
        id: "00000000-0000-4000-8000-000000000004",
        provider: "Unverified",
        url: "https://example.invalid/unverified",
        rating: 5,
        reviewCount: 100,
        verifiedAt: null,
        isVisible: false,
      },
    ],
  } as unknown as PublicPropertyRow;

  const dto = publicPropertyDetail(row, { status: "AVAILABLE" }, "https://wa.me/123");
  const json = JSON.stringify(dto);

  it("never leaks internal notes, owner data or the raw WhatsApp number", () => {
    expect(json).not.toContain("PROPERTY_INTERNAL_MARKER_DO_NOT_LEAK");
    expect(json).not.toContain("OWNER_INTERNAL_MARKER_PRIVATE");
    expect(json).not.toContain("propertyNotes");
    expect(json).not.toContain("ownerId");
    expect(json).not.toContain("+919000000002");
    expect(json).not.toMatch(/"owner"\s*:/);
    expect(json).not.toMatch(/"units"\s*:/);
    expect(json).not.toContain("Unverified");
  });

  it("keeps the guest-facing fields and verified-only proofs", () => {
    expect(dto.name).toBe("Marker apartment");
    expect(dto.description).toContain("public description");
    expect(dto.location.slug).toBe("test-city");
    expect(dto.availability).toEqual({ status: "AVAILABLE" });
    expect(dto.whatsappUrl).toBe("https://wa.me/123");
    expect(dto.externalListings).toHaveLength(0);
  });
});