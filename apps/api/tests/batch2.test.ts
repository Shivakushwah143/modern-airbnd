import { it, expect, describe } from "vitest";
import { searchSchema } from "../src/lib/dates.js";
import { stayEnquirySchema, ownerLeadSchema } from "../src/modules/schemas.js";
import { headerCtas, navMode, NAV_LINKS } from "../../web/lib/nav.js";

describe("QA-009 guest-count capacity filter input", () => {
  it("accepts a valid guest count", () =>
    expect(searchSchema.parse({ guests: "12" }).guests).toBe(12));
  it("accepts searches without a guest count", () =>
    expect(searchSchema.parse({}).guests).toBeUndefined());
  it("rejects zero, negative and non-integer counts", () => {
    expect(() => searchSchema.parse({ guests: "0" })).toThrow();
    expect(() => searchSchema.parse({ guests: "-3" })).toThrow();
    expect(() => searchSchema.parse({ guests: "2.5" })).toThrow();
    expect(() => searchSchema.parse({ guests: "many" })).toThrow();
    expect(() => searchSchema.parse({ guests: "201" })).toThrow();
  });
});

describe("QA-019 contact-form consent validation", () => {
  const enquiry = {
    propertyId: "00000000-0000-4000-8000-000000000001",
    checkIn: "2099-01-10",
    checkOut: "2099-01-12",
    adults: 2,
    guestName: "Guest",
    phone: "+919876543210",
  };
  it("accepts a compact guest enquiry when consent is not collected", () =>
    expect(stayEnquirySchema.parse(enquiry).consentAccepted).toBeUndefined());
  it("refuses an explicit guest-consent refusal", () =>
    expect(() =>
      stayEnquirySchema.parse({ ...enquiry, consentAccepted: false }),
    ).toThrow());
  it("accepts a guest enquiry with consent", () =>
    expect(
      stayEnquirySchema.parse({ ...enquiry, consentAccepted: true })
        .consentAccepted,
    ).toBe(true));
  it("refuses an owner lead without consent", () =>
    expect(() =>
      ownerLeadSchema.parse({
        name: "Owner",
        phone: "+919876543211",
        consentAccepted: false,
      }),
    ).toThrow());
  it("accepts an owner lead with consent", () =>
    expect(
      ownerLeadSchema.parse({
        name: "Owner",
        phone: "+919876543211",
        consentAccepted: true,
      }).consentAccepted,
    ).toBe(true));
});

describe("QA-012 route-aware header actions", () => {
  it("guest mode leads with Book a Stay", () => {
    const ctas = headerCtas("guest");
    expect(ctas[0]).toMatchObject({ href: "/stays", label: "Book a Stay" });
  });
  it("home/neutral surfaces both journeys", () => {
    const hrefs = headerCtas("neutral").map((c) => c.href);
    expect(hrefs).toContain("/stays");
    expect(hrefs).toContain("/owners");
  });
  it("owner mode keeps List your property", () =>
    expect(headerCtas("owner")[0]).toMatchObject({ href: "/owners" }));
  it("admin stays inside the workspace", () =>
    expect(headerCtas("admin")[0].href).toBe("/admin"));
  it("guest navigation can cross to the owner journey (mobile sheet)", () => {
    expect(NAV_LINKS.guest.map((l) => l.href)).toContain("/portfolio");
    expect(NAV_LINKS.owner.map((l) => l.href)).toContain("/portfolio");
    expect(NAV_LINKS.owner.map((l) => l.href)).toContain("/services");
  });
  it("stays and enquiry routes are guest mode; portfolio routes are owner mode", () => {
    expect(navMode("/stays/goa")).toBe("guest");
    expect(navMode("/enquiry/abc")).toBe("guest");
    expect(navMode("/portfolio/cities/goa")).toBe("owner");
    expect(navMode("/admin/pms")).toBe("admin");
  });
});
