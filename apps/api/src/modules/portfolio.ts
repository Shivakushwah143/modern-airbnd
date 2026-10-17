import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { AppError, found } from "../lib/errors.js";
import { idSchema } from "./schemas.js";
import { portfolioSignature } from "./media.js";

const text = (max: number, min = 0) => z.string().trim().min(min).max(max);
const mediaUrl = z
  .string()
  .trim()
  .max(2000)
  .refine(
    (v) => v === "" || /^https?:\/\/\S+$/i.test(v),
    "Media must be an http(s) URL.",
  );
const order = z.coerce.number().int().min(0).max(99999).default(0);

export const teamSchema = z.object({
  name: text(120, 1),
  title: text(120).default(""),
  role: text(120).default(""),
  bio: text(1000).default(""),
  photoUrl: mediaUrl.default(""),
  sortOrder: order,
  isPublished: z.boolean().default(false),
});
export const testimonialSchema = z.object({
  ownerName: text(120, 1),
  city: text(80).default(""),
  quote: text(1000).default(""),
  mediaType: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  mediaUrl: mediaUrl.default(""),
  sortOrder: order,
  isPublished: z.boolean().default(false),
});
export const caseSchema = z.object({
  propertyId: z.string().uuid().nullish().default(null),
  title: text(160, 1),
  slug: text(80, 1).optional(),
  city: text(80).default(""),
  summary: text(600).default(""),
  outcome: text(600).default(""),
  coverUrl: mediaUrl.default(""),
  sortOrder: order,
  isPublished: z.boolean().default(false),
});
export const visibilitySchema = z
  .object({
    guestEnabled: z.boolean().optional(),
    portfolioEnabled: z.boolean().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, "Provide a field to update.");

export const signatureInput = z
  .object({
    slot: z.enum(["team", "testimonials", "cases"]),
    kind: z.enum(["image", "video"]),
  })
  .strict();

export function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "item"
  );
}

export const portfolioAdmin = Router();
portfolioAdmin.use((req, res, next) => {
  if (!req.session.admin)
    return next(
      new AppError(401, "AUTH_REQUIRED", "Please sign in to continue."),
    );
  next();
});

portfolioAdmin.post("/portfolio/signature", (req, res) => {
  const b = signatureInput.parse(req.body);
  res.json({ data: portfolioSignature(b.slot, b.kind) });
});
portfolioAdmin.get("/portfolio/team", async (_req, res) =>
  res.json({
    data: await db.teamMember.findMany({ orderBy: { sortOrder: "asc" } }),
  }),
);
portfolioAdmin.post("/portfolio/team", async (req, res) =>
  res
    .status(201)
    .json({ data: await db.teamMember.create({ data: teamSchema.parse(req.body) }) }),
);
portfolioAdmin.patch("/portfolio/team/:id", async (req, res) =>
  res.json({
    data: await db.teamMember.update({
      where: { id: idSchema.parse(req.params.id) },
      data: teamSchema.partial().parse(req.body),
    }),
  }),
);
portfolioAdmin.delete("/portfolio/team/:id", async (req, res) => {
  await db.teamMember.delete({ where: { id: idSchema.parse(req.params.id) } });
  res.status(204).end();
});

portfolioAdmin.get("/portfolio/testimonials", async (_req, res) =>
  res.json({
    data: await db.mediaTestimonial.findMany({ orderBy: { sortOrder: "asc" } }),
  }),
);
portfolioAdmin.post("/portfolio/testimonials", async (req, res) =>
  res.status(201).json({
    data: await db.mediaTestimonial.create({
      data: testimonialSchema.parse(req.body),
    }),
  }),
);
portfolioAdmin.patch("/portfolio/testimonials/:id", async (req, res) =>
  res.json({
    data: await db.mediaTestimonial.update({
      where: { id: idSchema.parse(req.params.id) },
      data: testimonialSchema.partial().parse(req.body),
    }),
  }),
);
portfolioAdmin.delete("/portfolio/testimonials/:id", async (req, res) => {
  await db.mediaTestimonial.delete({
    where: { id: idSchema.parse(req.params.id) },
  });
  res.status(204).end();
});

portfolioAdmin.get("/portfolio/cases", async (_req, res) =>
  res.json({
    data: await db.portfolioCaseStudy.findMany({
      orderBy: { sortOrder: "asc" },
      include: { property: { select: { id: true, name: true, slug: true } } },
    }),
  }),
);
portfolioAdmin.post("/portfolio/cases", async (req, res) => {
  const body = caseSchema.parse(req.body);
  const slug = body.slug ? slugify(body.slug) : slugify(body.title);
  const { slug: _slug, ...data } = body;
  res
    .status(201)
    .json({
      data: await db.portfolioCaseStudy.create({ data: { ...data, slug } }),
    });
});
portfolioAdmin.patch("/portfolio/cases/:id", async (req, res) => {
  const body = caseSchema.partial().parse(req.body);
  const slug = body.slug ? slugify(body.slug) : undefined;
  const { slug: _slug, ...data } = body;
  res.json({
    data: await db.portfolioCaseStudy.update({
      where: { id: idSchema.parse(req.params.id) },
      data: { ...data, ...(slug ? { slug } : {}) },
    }),
  });
});
portfolioAdmin.delete("/portfolio/cases/:id", async (req, res) => {
  await db.portfolioCaseStudy.delete({
    where: { id: idSchema.parse(req.params.id) },
  });
  res.status(204).end();
});

portfolioAdmin.patch("/portfolio/properties/:id", async (req, res) => {
  const flags = visibilitySchema.parse(req.body);
  const p = found(
    await db.property.update({
      where: { id: idSchema.parse(req.params.id) },
      data: flags,
    }),
  );
  res.json({
    data: {
      id: p.id,
      guestEnabled: p.guestEnabled,
      portfolioEnabled: p.portfolioEnabled,
    },
  });
});

export const portfolioPublic = Router();

portfolioPublic.get("/portfolio", async (_req, res) => {
  const portfolioWhere = {
    status: "PUBLISHED" as const,
    guestEnabled: true,
    portfolioEnabled: true,
    location: { isActive: true },
  };
  const [caseStudies, team, testimonials, cityGroups] = await Promise.all([
    db.portfolioCaseStudy.findMany({
      where: { isPublished: true },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        city: true,
        summary: true,
        outcome: true,
        coverUrl: true,
        property: { select: { slug: true, name: true } },
      },
    }),
    db.teamMember.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        title: true,
        role: true,
        bio: true,
        photoUrl: true,
      },
    }),
    db.mediaTestimonial.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        ownerName: true,
        city: true,
        quote: true,
        mediaType: true,
        mediaUrl: true,
      },
    }),
    db.location.findMany({
      where: {
        isActive: true,
        properties: { some: portfolioWhere },
      },
      orderBy: { name: "asc" },
      select: {
        name: true,
        slug: true,
        state: true,
        _count: { select: { properties: { where: portfolioWhere } } },
      },
    }),
  ]);
  const cities = cityGroups.map((l) => ({
    name: l.name,
    slug: l.slug,
    state: l.state,
    count: l._count.properties,
  }));
  res.json({
    data: {
      caseStudies,
      team,
      testimonials,
      cities,
      managedCount: cities.reduce((n, c) => n + c.count, 0),
    },
  });
});

portfolioPublic.get("/portfolio/cities/:slug", async (req, res) => {
  const slug = String(req.params.slug);
  const location = found(
    await db.location.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true, state: true, isActive: true },
    }),
  );
  if (!location.isActive)
    throw new AppError(404, "RESOURCE_NOT_FOUND", "City not found.");
  const properties = await db.property.findMany({
    where: {
      locationId: location.id,
      status: "PUBLISHED",
      guestEnabled: true,
      portfolioEnabled: true,
    },
    orderBy: { name: "asc" },
    take: 200,
    select: {
      id: true,
      name: true,
      slug: true,
      area: true,
      propertyType: true,
      shortDescription: true,
      bedrooms: true,
      bathrooms: true,
      beds: true,
      maxGuests: true,
      isDemo: true,
      media: {
        orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
        take: 1,
        select: {
          id: true,
          secureUrl: true,
          cloudinaryPublicId: true,
          altText: true,
          isCover: true,
          sortOrder: true,
          width: true,
          height: true,
        },
      },
    },
  });
  const { id: _id, ...loc } = location;
  res.json({ data: { location: loc, properties } });
});