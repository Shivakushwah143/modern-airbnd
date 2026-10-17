import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import argon2 from "argon2";
import { randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import request from "supertest";
const cloud = vi.hoisted(() => ({ resource: vi.fn(), destroy: vi.fn() }));
vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    utils: { api_sign_request: vi.fn(() => "test-signature") },
    api: { resource: cloud.resource },
    uploader: { destroy: cloud.destroy },
  },
}));
const password = randomBytes(24).toString("hex");
const origin = "http://localhost:3400";
let app: typeof import("../src/app.js").app;
let db: typeof import("../src/db.js").db;
let pool: typeof import("../src/db.js").sessionPool;
let agent: ReturnType<typeof request.agent>;
let locationId: string,
  propertyId: string,
  unitId: string,
  secondUnitId: string,
  mediaId: string,
  blockId: string,
  demoPropertyId: string;
const body = {
  name: "Integration apartment",
  slug: "integration-apartment",
  locationId: "",
  description:
    "A test property with enough description for the publication rules.",
  whatsappNumber: "+919876543210",
};
beforeAll(async () => {
  const url = process.env.TEST_DATABASE_URL;
  if (!url || !new URL(url).pathname.endsWith("_test"))
    throw new Error(
      "TEST_DATABASE_URL must identify a disposable database ending in _test.",
    );
  Object.assign(process.env, {
    DATABASE_URL: url,
    NODE_ENV: "test",
    APP_ORIGIN: origin,
    SESSION_SECRET: randomBytes(40).toString("hex"),
    ADMIN_PASSWORD_HASH: await argon2.hash(password),
    CLOUDINARY_CLOUD_NAME: "test-cloud",
    CLOUDINARY_API_KEY: "test-key",
    CLOUDINARY_API_SECRET: "test-secret",
    LOG_LEVEL: "silent",
  });
  execFileSync(
    process.execPath,
    [
      "node_modules/prisma/build/index.js",
      "migrate",
      "deploy",
      "--schema=apps/api/prisma/schema.prisma",
    ],
    { env: process.env, stdio: "pipe" },
  );
  ({ app } = await import("../src/app.js"));
  ({ db, sessionPool: pool } = await import("../src/db.js"));
  await db.$executeRawUnsafe(
    'TRUNCATE "Location", "Property", "Unit", "AvailabilityBlock", "PropertyMedia", "Amenity", "ExternalListing", "SiteSettings", "admin_session" CASCADE',
  );
  agent = request.agent(app);
});
afterAll(async () => {
  await db?.$disconnect();
  await pool?.end();
});
describe("API with real PostgreSQL; Cloudinary adapter stubbed", () => {
  it("health distinguishes liveness and database readiness", async () => {
    expect((await request(app).get("/api/v1/health/live")).status).toBe(200);
    expect((await request(app).get("/api/v1/health/ready")).status).toBe(200);
  });
  it("protects every admin path", async () => {
    for (const path of ["properties", "locations", "settings", "amenities"])
      expect((await request(app).get(`/api/v1/admin/${path}`)).status).toBe(
        401,
      );
  });
  it("rejects missing or foreign mutation origin", async () => {
    for (const o of ["", "https://evil.invalid"])
      expect(
        (
          await request(app)
            .post("/api/v1/admin/auth/login")
            .set("Origin", o)
            .send({ password })
        ).status,
      ).toBe(403);
  });
  it("rejects invalid password", async () =>
    expect(
      (
        await request(app)
          .post("/api/v1/admin/auth/login")
          .set("Origin", origin)
          .send({ password: "wrong" })
      ).status,
    ).toBe(401));
  it("private preview requires authentication", async () =>
    expect(
      (
        await request(app).get(
          "/api/v1/admin/properties/00000000-0000-4000-8000-000000000000/preview",
        )
      ).status,
    ).toBe(401));
  it("logs in with HttpOnly SameSite cookie", async () => {
    const r = await agent
      .post("/api/v1/admin/auth/login")
      .set("Origin", origin)
      .send({ password });
    expect(r.status).toBe(200);
    expect(String(r.headers["set-cookie"])).toContain("HttpOnly");
    expect(String(r.headers["set-cookie"])).toContain("SameSite=Strict");
    expect((await agent.get("/api/v1/admin/auth/session")).status).toBe(200);
    expect(await db.$queryRaw`SELECT sid FROM admin_session`).toHaveLength(1);
  });
  it("creates a location", async () => {
    const r = await agent
      .post("/api/v1/admin/locations")
      .set("Origin", origin)
      .send({ name: "Test City", slug: "test-city" });
    expect(r.status).toBe(201);
    locationId = r.body.data.id;
    body.locationId = locationId;
  });
  it("rejects unknown fields and invalid foreign keys", async () => {
    expect(
      (
        await agent
          .post("/api/v1/admin/properties")
          .set("Origin", origin)
          .send({ ...body, status: "PUBLISHED" })
      ).status,
    ).toBe(400);
    expect(
      (
        await agent
          .post("/api/v1/admin/properties")
          .set("Origin", origin)
          .send({ ...body, locationId: "00000000-0000-4000-8000-000000000000" })
      ).status,
    ).toBe(404);
  });
  it("creates a draft and default unit atomically", async () => {
    const r = await agent
      .post("/api/v1/admin/properties")
      .set("Origin", origin)
      .send(body);
    expect(r.status).toBe(201);
    propertyId = r.body.data.id;
    unitId = r.body.data.units[0].id;
    expect(r.body.data.status).toBe("DRAFT");
  });
  it("whole-property mode rejects extra inventory", async () =>
    expect(
      (
        await agent
          .post(`/api/v1/admin/properties/${propertyId}/units`)
          .set("Origin", origin)
          .send({ name: "Room 101" })
      ).status,
    ).toBe(409));
  it("private preview and readiness work without publishing", async () => {
    const r = await agent.get(`/api/v1/admin/properties/${propertyId}/preview`);
    expect(r.status).toBe(200);
    expect(r.headers["x-robots-tag"]).toContain("noindex");
    expect(
      (await agent.get(`/api/v1/admin/properties/${propertyId}/readiness`)).body
        .data.ready,
    ).toBe(false);
  });
  it("drafts and their locations are private", async () => {
    expect(
      (await request(app).get("/api/v1/properties")).body.data,
    ).toHaveLength(0);
    expect(
      (await request(app).get("/api/v1/locations")).body.data,
    ).toHaveLength(0);
    expect(
      (await request(app).get("/api/v1/properties/integration-apartment"))
        .status,
    ).toBe(404);
  });
  it("prevents duplicate slugs and premature publication", async () => {
    expect(
      (
        await agent
          .post("/api/v1/admin/properties")
          .set("Origin", origin)
          .send(body)
      ).status,
    ).toBe(409);
    expect(
      (
        await agent
          .post(`/api/v1/admin/properties/${propertyId}/publish`)
          .set("Origin", origin)
      ).status,
    ).toBe(422);
  });
  it("signs media uploads without exposing the secret", async () => {
    const r = await agent
      .post("/api/v1/admin/media/signature")
      .set("Origin", origin)
      .send({ propertyId });
    expect(r.status).toBe(200);
    expect(r.body.data.public_id).toContain(
      `modern-airbnd/properties/${propertyId}/`,
    );
    expect(JSON.stringify(r.body)).not.toContain("test-secret");
  });
  it("registers independently verified media metadata", async () => {
    const publicId = `modern-airbnd/properties/${propertyId}/asset-one`;
    cloud.resource.mockResolvedValue({
      resource_type: "image",
      format: "jpg",
      bytes: 1000,
      width: 640,
      height: 480,
      secure_url:
        "https://res.cloudinary.com/test-cloud/image/upload/asset-one.jpg",
    });
    const r = await agent
      .post(`/api/v1/admin/properties/${propertyId}/media`)
      .set("Origin", origin)
      .send({ publicId, altText: "Test fixture photo" });
    expect(r.status).toBe(201);
    mediaId = r.body.data.id;
    expect(r.body.data.isCover).toBe(true);
    expect(cloud.resource).toHaveBeenCalledWith(publicId, {
      resource_type: "image",
      type: "upload",
    });
  });
  it("rejects foreign media and oversized assets", async () => {
    expect(
      (
        await agent
          .post(`/api/v1/admin/properties/${propertyId}/media`)
          .set("Origin", origin)
          .send({ publicId: "foreign/asset", altText: "Foreign image" })
      ).status,
    ).toBe(400);
    cloud.resource.mockResolvedValueOnce({
      resource_type: "image",
      format: "jpg",
      bytes: 11000000,
    });
    expect(
      (
        await agent
          .post(`/api/v1/admin/properties/${propertyId}/media`)
          .set("Origin", origin)
          .send({
            publicId: `modern-airbnd/properties/${propertyId}/too-large`,
            altText: "Large image",
          })
      ).status,
    ).toBe(400);
  });
  it("publishes and returns a neutral no-date state", async () => {
    expect(
      (
        await agent
          .post(`/api/v1/admin/properties/${propertyId}/publish`)
          .set("Origin", origin)
      ).status,
    ).toBe(200);
    const r = await request(app).get("/api/v1/properties");
    expect(r.body.data[0].availability.status).toBe("NOT_EVALUATED");
    expect(r.body.data[0]).not.toHaveProperty("units");
    expect(r.body.data[0]).not.toHaveProperty("description");
  });
  it("prevents removing last unit, photo, content or active location", async () => {
    expect(
      (
        await agent
          .patch(`/api/v1/admin/units/${unitId}`)
          .set("Origin", origin)
          .send({ name: "Entire Property", isActive: false })
      ).status,
    ).toBe(409);
    expect(
      (
        await agent
          .delete(`/api/v1/admin/properties/${propertyId}/media/${mediaId}`)
          .set("Origin", origin)
      ).status,
    ).toBe(422);
    expect(
      (
        await agent
          .patch(`/api/v1/admin/properties/${propertyId}`)
          .set("Origin", origin)
          .send({ ...body, description: "" })
      ).status,
    ).toBe(422);
    expect(
      (
        await agent
          .patch(`/api/v1/admin/locations/${locationId}`)
          .set("Origin", origin)
          .send({ name: "Test City", slug: "test-city", isActive: false })
      ).status,
    ).toBe(409);
  });
  it("blocks dates and returns unavailable", async () => {
    const r = await agent
      .post(`/api/v1/admin/units/${unitId}/availability-blocks`)
      .set("Origin", origin)
      .send({
        startDate: "2099-01-12",
        endDate: "2099-01-15",
        reason: "BOOKED",
        note: "private operational note",
      });
    expect(r.status).toBe(201);
    blockId = r.body.data.id;
    const p = await request(app).get(
      "/api/v1/properties?checkIn=2099-01-12&checkOut=2099-01-15",
    );
    expect(p.body.data[0].availability.status).toBe("UNAVAILABLE");
    expect(JSON.stringify(p.body)).not.toContain("private operational note");
  });
  it("permits adjacent check-in and warns on overlapping blocks", async () => {
    expect(
      (
        await request(app).get(
          "/api/v1/properties?checkIn=2099-01-15&checkOut=2099-01-17",
        )
      ).body.data[0].availability.status,
    ).toBe("AVAILABLE");
    const r = await agent
      .post(`/api/v1/admin/units/${unitId}/availability-blocks`)
      .set("Origin", origin)
      .send({ startDate: "2099-01-13", endDate: "2099-01-14" });
    expect(r.body.meta.warning).toBeTruthy();
    await agent
      .delete(`/api/v1/admin/availability-blocks/${r.body.data.id}`)
      .set("Origin", origin);
  });
  it("enforces positive dates in API and database", async () => {
    expect(
      (
        await agent
          .post(`/api/v1/admin/units/${unitId}/availability-blocks`)
          .set("Origin", origin)
          .send({ startDate: "2099-01-15", endDate: "2099-01-12" })
      ).status,
    ).toBe(400);
    await expect(
      db.availabilityBlock.create({
        data: {
          unitId,
          startDate: new Date("2099-01-15"),
          endDate: new Date("2099-01-12"),
        },
      }),
    ).rejects.toThrow();
  });
  it("one free unit makes property available", async () => {
    await agent
      .post(`/api/v1/admin/properties/${propertyId}/unpublish`)
      .set("Origin", origin);
    await agent
      .patch(`/api/v1/admin/properties/${propertyId}/inventory`)
      .set("Origin", origin)
      .send({ mode: "MULTI_UNIT" });
    const r = await agent
      .post(`/api/v1/admin/properties/${propertyId}/units`)
      .set("Origin", origin)
      .send({ name: "Second unit" });
    secondUnitId = r.body.data.id;
    const copied = await db.availabilityBlock.findMany({
      where: { unitId: secondUnitId },
    });
    for (const b of copied)
      await agent
        .delete(`/api/v1/admin/availability-blocks/${b.id}`)
        .set("Origin", origin);
    const occupied = await agent
      .post(`/api/v1/admin/properties/${propertyId}/units`)
      .set("Origin", origin)
      .send({ name: "First real room" });
    unitId = occupied.body.data.id;
    blockId = (await db.availabilityBlock.findFirst({ where: { unitId } }))!.id;
    await agent
      .post(`/api/v1/admin/properties/${propertyId}/publish`)
      .set("Origin", origin);
    expect(
      (
        await request(app).get(
          "/api/v1/properties?checkIn=2099-01-12&checkOut=2099-01-15",
        )
      ).body.data[0].availability,
    ).toEqual({ status: "AVAILABLE", availableUnits: 1 });
  });
  it("does not combine two partially available units", async () => {
    await agent
      .post(`/api/v1/admin/units/${secondUnitId}/availability-blocks`)
      .set("Origin", origin)
      .send({ startDate: "2099-01-15", endDate: "2099-01-18" });
    expect(
      (
        await request(app).get(
          "/api/v1/properties?checkIn=2099-01-12&checkOut=2099-01-18",
        )
      ).body.data[0].availability.status,
    ).toBe("UNAVAILABLE");
  });
  it("keeps unavailable enquiries truthful and hides internal notes", async () => {
    const r = await request(app).get(
      "/api/v1/properties/integration-apartment?checkIn=2099-01-12&checkOut=2099-01-18",
    );
    expect(decodeURIComponent(r.body.data.whatsappUrl)).toContain(
      "alternative dates",
    );
    expect(JSON.stringify(r.body)).not.toContain("private operational note");
  });
  it("removing a block reopens only the affected range", async () => {
    expect(
      (
        await agent
          .delete(`/api/v1/admin/availability-blocks/${blockId}`)
          .set("Origin", origin)
      ).status,
    ).toBe(204);
    expect(
      (
        await request(app).get(
          "/api/v1/properties?checkIn=2099-01-12&checkOut=2099-01-18",
        )
      ).body.data[0].availability.status,
    ).toBe("AVAILABLE");
  });
  it("supports owners, operations, housekeeping and maintenance", async () => {
    const owner = await agent
      .post("/api/v1/admin/owners")
      .set("Origin", origin)
      .send({ name: "Owner One", phone: "+919888888888", email: "", notes: "Managed" });
    expect(owner.status).toBe(201);
    expect(
      (
        await agent
          .patch(`/api/v1/admin/properties/${propertyId}/owner`)
          .set("Origin", origin)
          .send({ ownerId: owner.body.data.id })
      ).status,
    ).toBe(200);
    expect((await agent.get("/api/v1/admin/owners")).body.data[0].properties[0].id).toBe(propertyId);
    const reservation = await agent
      .post("/api/v1/admin/reservations")
      .set("Origin", origin)
      .send({
        propertyId,
        source: "DIRECT",
        checkIn: "2099-02-01",
        checkOut: "2099-02-03",
        adults: 2,
        children: 0,
        guestName: "Ops Guest",
        phone: "+919777777777",
      });
    expect(reservation.status).toBe(201);
    expect(
      (
        await agent
          .post(`/api/v1/admin/reservations/${reservation.body.data.id}/check-in`)
          .set("Origin", origin)
          .send({ notes: "Arrived" })
      ).body.data.stayStatus,
    ).toBe("CHECKED_IN");
    expect(
      (
        await agent
          .post(`/api/v1/admin/reservations/${reservation.body.data.id}/check-out`)
          .set("Origin", origin)
          .send({ notes: "Left" })
      ).body.data.stayStatus,
    ).toBe("CHECKED_OUT");
    const housekeeping = await agent
      .post("/api/v1/admin/housekeeping")
      .set("Origin", origin)
      .send({
        propertyId,
        reservationId: reservation.body.data.id,
        dueDate: "2099-02-03",
        notes: "Checkout clean",
      });
    expect(housekeeping.status).toBe(201);
    expect(
      (
        await agent
          .patch(`/api/v1/admin/housekeeping/${housekeeping.body.data.id}/status`)
          .set("Origin", origin)
          .send({ status: "DONE" })
      ).body.data.status,
    ).toBe("DONE");
    const maintenance = await agent
      .post("/api/v1/admin/maintenance")
      .set("Origin", origin)
      .send({
        propertyId,
        title: "AC check",
        description: "Cooling slow",
        priority: "HIGH",
        cost: 500,
      });
    expect(maintenance.status).toBe(201);
    expect(
      (
        await agent
          .patch(`/api/v1/admin/maintenance/${maintenance.body.data.id}/status`)
          .set("Origin", origin)
          .send({ status: "RESOLVED" })
      ).body.data.status,
    ).toBe("RESOLVED");
    const dash = await agent.get("/api/v1/admin/dashboard");
    expect(dash.status).toBe(200);
    expect(dash.body.data.counts.totalProperties).toBeGreaterThan(0);
  });
  it("requires verification for visible source claims", async () => {
    const r = await agent
      .post(`/api/v1/admin/properties/${propertyId}/proofs`)
      .set("Origin", origin)
      .send({
        provider: "Unverified",
        url: "https://example.test",
        rating: 5,
        reviewCount: 100,
        verifiedAt: null,
        isVisible: true,
      });
    expect(r.status).toBe(400);
  });
  it("QA-002: new properties opt out of the owner portfolio by default", async () => {
    const p = await db.property.findUnique({ where: { id: propertyId } });
    expect(p?.portfolioEnabled).toBe(false);
    const r = await agent
      .patch(`/api/v1/admin/portfolio/properties/${propertyId}`)
      .set("Origin", origin)
      .send({ portfolioEnabled: true });
    expect(r.status).toBe(200);
  });
  it("QA-005: hidden and demo properties refuse public enquiries; no rows created", async () => {
    const enquiryBody = {
      propertyId,
      checkIn: "2099-03-01",
      checkOut: "2099-03-03",
      adults: 1,
      children: 0,
      guestName: "QA Guest",
      phone: "+919777777771",
      consentAccepted: true,
    };
    const ok = await request(app).post("/api/v1/enquiries").send(enquiryBody);
    expect(ok.status).toBe(201);
    expect(ok.body.data.enquiry.consentAccepted).toBe(true);
    expect(ok.body.data.enquiry.consentRecordedAt).toBeTruthy();
    // QA-018: the acknowledgement reference verifies without exposing PII.
    const receiptId = ok.body.data.enquiry.id as string;
    const receipt = await request(app).get(`/api/v1/enquiries/${receiptId}/receipt`);
    expect(receipt.status).toBe(200);
    expect(receipt.body.data).toEqual({ reference: receiptId });
    expect(JSON.stringify(receipt.body)).not.toContain("QA Guest");
    const missing = await request(app).get(
      "/api/v1/enquiries/00000000-0000-4000-8000-000000000099/receipt",
    );
    expect(missing.status).toBe(404);
    // QA-019: consent is validated server-side.
    const noConsent = await request(app)
      .post("/api/v1/enquiries")
      .send({ ...enquiryBody, consentAccepted: false });
    expect(noConsent.status).toBe(400);
    const before = await db.enquiry.count();
    // Guest-hidden property: bypass attempt via direct POST must 404 and write nothing.
    await agent
      .patch(`/api/v1/admin/portfolio/properties/${propertyId}`)
      .set("Origin", origin)
      .send({ guestEnabled: false });
    const hidden = await request(app)
      .post("/api/v1/enquiries")
      .send(enquiryBody);
    expect(hidden.status).toBe(404);
    expect(hidden.body.error.code).toBe("RESOURCE_NOT_FOUND");
    expect(await db.enquiry.count()).toBe(before);
    await agent
      .patch(`/api/v1/admin/portfolio/properties/${propertyId}`)
      .set("Origin", origin)
      .send({ guestEnabled: true });
    // Demo inventory: rejected with an explicit reason, and writes nothing.
    const demo = await db.property.create({
      data: {
        name: "QA demo stay",
        slug: "qa005-demo-stay",
        locationId,
        status: "PUBLISHED",
        isDemo: true,
        units: { create: { name: "Entire Property", isEntireProperty: true } },
      },
    });
    demoPropertyId = demo.id;
    const demoRes = await request(app)
      .post("/api/v1/enquiries")
      .send({ ...enquiryBody, propertyId: demo.id });
    expect(demoRes.status).toBe(409);
    expect(demoRes.body.error.code).toBe("DEMO_READ_ONLY");
    expect(await db.enquiry.count()).toBe(before);
  });
  it("QA-019: owner leads record consent with a server timestamp", async () => {
    const denied = await request(app)
      .post("/api/v1/owner-leads")
      .send({ name: "QA Lead", phone: "+919777777772", consentAccepted: false });
    expect(denied.status).toBe(400);
    const beforeLeads = await db.ownerLead.count({
      where: { phone: "+919777777772" },
    });
    const accepted = await request(app)
      .post("/api/v1/owner-leads")
      .send({ name: "QA Lead", phone: "+919777777772", consentAccepted: true });
    expect(accepted.status).toBe(201);
    expect(accepted.body.data.consentAccepted).toBe(true);
    expect(accepted.body.data.consentRecordedAt).toBeTruthy();
    // OwnerLead rows are not truncated between runs — assert the delta instead.
    expect(
      await db.ownerLead.count({ where: { phone: "+919777777772" } }),
    ).toBe(beforeLeads + 1);
  });
  it("QA-009: guest-count search filters capacity server-side", async () => {
    // The integration property sleeps 2; a party of 12 must be excluded.
    const large = await request(app).get("/api/v1/properties?guests=12");
    expect(large.status).toBe(200);
    expect(large.body.data).toHaveLength(0);
    const pair = await request(app).get("/api/v1/properties?guests=2");
    expect(
      pair.body.data.map((p: { slug: string }) => p.slug),
    ).toContain("integration-apartment");
    const bad = await request(app).get("/api/v1/properties?guests=0");
    expect(bad.status).toBe(400);
  });
  it("QA-001: portfolio keeps guest-hidden listings and excludes demo from managed counts", async () => {
    await agent
      .patch(`/api/v1/admin/portfolio/properties/${propertyId}`)
      .set("Origin", origin)
      .send({ guestEnabled: false });
    const guestList = await request(app).get("/api/v1/properties");
    expect(
      guestList.body.data.map((p: { slug: string }) => p.slug),
    ).not.toContain("integration-apartment");
    const portfolio = await request(app).get("/api/v1/portfolio");
    expect(portfolio.status).toBe(200);
    const city = portfolio.body.data.cities.find(
      (c: { slug: string }) => c.slug === "test-city",
    );
    // The demo property at the same city is excluded from managed counts.
    expect(city?.count).toBe(1);
    expect(portfolio.body.data.managedCount).toBe(1);
    // Linked case studies obey portfolio eligibility; independent stories stay.
    const linked = await agent
      .post("/api/v1/admin/portfolio/cases")
      .set("Origin", origin)
      .send({ title: "Demo linked case", propertyId: demoPropertyId, isPublished: true });
    expect(linked.status).toBe(201);
    const independent = await agent
      .post("/api/v1/admin/portfolio/cases")
      .set("Origin", origin)
      .send({ title: "Independent owner story", isPublished: true });
    expect(independent.status).toBe(201);
    const after = await request(app).get("/api/v1/portfolio");
    expect(
      after.body.data.caseStudies.map((c: { title: string }) => c.title),
    ).toEqual(["Independent owner story"]);
    await agent
      .patch(`/api/v1/admin/portfolio/properties/${propertyId}`)
      .set("Origin", origin)
      .send({ guestEnabled: true });
  });
  it("QA-010/011: owner-facing portfolio property endpoint exposes no booking internals", async () => {
    const r = await request(app).get(
      "/api/v1/portfolio/properties/integration-apartment",
    );
    expect(r.status).toBe(200);
    const raw = JSON.stringify(r.body);
    // QA-010: no booking prices, availability, WhatsApp internals, owner data
    // or internal notes on the owner-facing view.
    expect(raw).not.toMatch(/"whatsappUrl"/);
    expect(raw).not.toMatch(/"availability"/);
    expect(raw).not.toMatch(/"owner"/);
    expect(raw).not.toMatch(/"propertyNotes"/);
    expect(raw).not.toMatch(/"whatsappNumber"/);
    expect(raw).not.toContain("QA003_PRIVATE_MARKER_NOTE");
    expect(r.body.data.property.name).toBe("Integration apartment");
    expect(r.body.data.property.location.slug).toBe("test-city");
    // Demo inventory and unknown slugs are not portfolio-eligible.
    expect(
      (await request(app).get("/api/v1/portfolio/properties/qa005-demo-stay"))
        .status,
    ).toBe(404);
    expect(
      (await request(app).get("/api/v1/portfolio/properties/no-such-place"))
        .status,
    ).toBe(404);
  });
  it("QA-003: public property detail hides internal notes and owner records", async () => {
    const owner = await db.owner.create({
      data: {
        name: "QA Owner",
        phone: "+919888000001",
        notes: "OWNER_INTERNAL_NOTES_QA003",
      },
    });
    await agent
      .patch(`/api/v1/admin/properties/${propertyId}`)
      .set("Origin", origin)
      .send({ ...body, propertyNotes: "QA003_PRIVATE_MARKER_NOTE" });
    await agent
      .patch(`/api/v1/admin/properties/${propertyId}/owner`)
      .set("Origin", origin)
      .send({ ownerId: owner.id });
    const r = await request(app).get(
      "/api/v1/properties/integration-apartment",
    );
    expect(r.status).toBe(200);
    const raw = JSON.stringify(r.body);
    expect(raw).not.toContain("QA003_PRIVATE_MARKER_NOTE");
    expect(raw).not.toContain("OWNER_INTERNAL_NOTES_QA003");
    expect(raw).not.toMatch(/"propertyNotes"/);
    expect(raw).not.toMatch(/"ownerId"/);
    expect(raw).not.toMatch(/"owner":/);
    expect(r.body.data.name).toBe("Integration apartment");
  });
  it("QA-004: testimonial publishing requires media and recorded consent", async () => {
    const post = (payload: unknown) =>
      agent
        .post("/api/v1/admin/portfolio/testimonials")
        .set("Origin", origin)
        .send(payload as object);
    const noMedia = await post({
      ownerName: "QA Owner Two",
      isPublished: true,
      consentConfirmed: true,
      consentSource: "WhatsApp",
    });
    expect(noMedia.status).toBe(422);
    expect(noMedia.body.error.code).toBe("TESTIMONIAL_NOT_PUBLISHABLE");
    const noConsent = await post({
      ownerName: "QA Owner Two",
      isPublished: true,
      mediaUrl: "https://cdn.example.com/qa004.png",
    });
    expect(noConsent.status).toBe(422);
    const draft = await post({ ownerName: "QA Owner Two" });
    expect(draft.status).toBe(201);
    expect(draft.body.data.isPublished).toBe(false);
    const id = draft.body.data.id as string;
    const publishNoConsent = await agent
      .patch(`/api/v1/admin/portfolio/testimonials/${id}`)
      .set("Origin", origin)
      .send({ isPublished: true, mediaUrl: "https://cdn.example.com/qa004.png" });
    expect(publishNoConsent.status).toBe(422);
    const publish = await agent
      .patch(`/api/v1/admin/portfolio/testimonials/${id}`)
      .set("Origin", origin)
      .send({
        isPublished: true,
        mediaUrl: "https://cdn.example.com/qa004.png",
        consentConfirmed: true,
        consentSource: "WhatsApp approval from the owner",
      });
    expect(publish.status).toBe(200);
    expect(publish.body.data.consentRecordedAt).toBeTruthy();
    // Revoking consent on a published testimonial must also be refused.
    const revoke = await agent
      .patch(`/api/v1/admin/portfolio/testimonials/${id}`)
      .set("Origin", origin)
      .send({ consentConfirmed: false });
    expect(revoke.status).toBe(422);
    const list = await request(app).get("/api/v1/portfolio");
    expect(
      list.body.data.testimonials.map((t: { id: string }) => t.id),
    ).toContain(id);
    // A direct database write that bypasses validation must still be filtered
    // by the public query (published without media).
    await db.mediaTestimonial.create({
      data: {
        ownerName: "QA Bypass",
        mediaUrl: "",
        isPublished: true,
        consentConfirmed: true,
        consentSource: "db write",
      },
    });
    const after = await request(app).get("/api/v1/portfolio");
    expect(
      after.body.data.testimonials.every(
        (t: { ownerName: string }) => t.ownerName !== "QA Bypass",
      ),
    ).toBe(true);
  });
  it("unpublish and archive hide direct pages", async () => {
    await agent
      .post(`/api/v1/admin/properties/${propertyId}/unpublish`)
      .set("Origin", origin);
    expect(
      (await request(app).get("/api/v1/properties/integration-apartment"))
        .status,
    ).toBe(404);
    await agent
      .post(`/api/v1/admin/properties/${propertyId}/archive`)
      .set("Origin", origin);
    expect(
      (await db.property.findUnique({ where: { id: propertyId } }))?.status,
    ).toBe("ARCHIVED");
  });
  it("logout revokes the server-side session", async () => {
    expect(
      (await agent.post("/api/v1/admin/auth/logout").set("Origin", origin))
        .status,
    ).toBe(204);
    expect((await agent.get("/api/v1/admin/properties")).status).toBe(401);
  });
  it("login limiter returns 429", async () => {
    let status = 0;
    for (let i = 0; i < 6; i++)
      status = (
        await request(app)
          .post("/api/v1/admin/auth/login")
          .set("Origin", origin)
          .send({ password: "wrong" })
      ).status;
    expect(status).toBe(429);
  });
});
