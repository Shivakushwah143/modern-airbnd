import { Prisma } from "@prisma/client";
import { db } from "../db.js";
import { env } from "../config/env.js";
import { AppError, found } from "../lib/errors.js";
import { availability, toDate, searchSchema } from "../lib/dates.js";
import { whatsapp } from "../lib/whatsapp.js";
import { propertySchema } from "./schemas.js";
import { z } from "zod";
import { inventoryErrors, eligibleUnits } from "./inventory.js";
export const include = {
  location: true,
  owner: true,
  units: { orderBy: { sortOrder: "asc" as const }, include: { blocks: true } },
  media: {
    orderBy: [{ isCover: "desc" as const }, { sortOrder: "asc" as const }],
  },
  amenities: true,
  externalListings: true,
};
export type FullProperty = Prisma.PropertyGetPayload<{
  include: typeof include;
}>;
export async function settings() {
  return db.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });
}
export function publishErrors(p: FullProperty, fallback: string) {
  const errors: string[] = [];
  if (p.description.trim().length < 30)
    errors.push("Add a description of at least 30 characters.");
  if (!p.location.isActive) errors.push("Choose an active location.");
  errors.push(...inventoryErrors(p));
  if (!p.media.length) errors.push("Upload at least one property photo.");
  if (!p.whatsappNumber && !fallback)
    errors.push("Add a property or global WhatsApp number.");
  return errors;
}
export async function ensurePublishable(
  tx: Prisma.TransactionClient,
  id: string,
) {
  const p = found(await tx.property.findUnique({ where: { id }, include }));
  const s = await tx.siteSettings.findUnique({ where: { id: 1 } });
  const errors = publishErrors(p, s?.defaultWhatsappNumber || "");
  if (errors.length)
    throw new AppError(
      422,
      "PROPERTY_NOT_PUBLISHABLE",
      "Complete the property before publishing.",
      errors,
    );
  return p;
}
export async function saveProperty(body: unknown, id?: string) {
  const { amenityIds, ...data } = propertySchema.parse(body);
  return db.$transaction(
    async (tx) => {
      if (id) {
        const old = found(await tx.property.findUnique({ where: { id } }));
        if (old.isDemo)
          throw new AppError(
            409,
            "DEMO_READ_ONLY",
            "Create a new property for real inventory. Demo records cannot be converted.",
          );
      }
      const p = id
        ? await tx.property.update({
            where: { id },
            data: {
              ...data,
              amenities: { set: amenityIds.map((id) => ({ id })) },
            },
          })
        : await tx.property.create({
            data: {
              ...data,
              amenities: { connect: amenityIds.map((id) => ({ id })) },
              units: {
                create: { name: "Entire Property", isEntireProperty: true },
              },
            },
          });
      if (p.status === "PUBLISHED") await ensurePublishable(tx, p.id);
      return tx.property.findUnique({ where: { id: p.id }, include });
    },
    { isolationLevel: "Serializable" },
  );
}
export async function transition(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
) {
  return db.$transaction(
    async (tx) => {
      const p = found(await tx.property.findUnique({ where: { id } }));
      if (p.isDemo && status === "PUBLISHED")
        throw new AppError(
          409,
          "DEMO_READ_ONLY",
          "Demo inventory cannot be published through the admin.",
        );
      if (status === "PUBLISHED") await ensurePublishable(tx, id);
      return tx.property.update({
        where: { id },
        data: {
          status,
          publishedAt: status === "PUBLISHED" ? new Date() : p.publishedAt,
          archivedAt: status === "ARCHIVED" ? new Date() : null,
        },
      });
    },
    { isolationLevel: "Serializable" },
  );
}
export async function publicProperties(query: unknown, slug?: string) {
  const q = searchSchema.parse(query);
  const where: Prisma.PropertyWhereInput = {
    status: "PUBLISHED",
    location: { isActive: true, ...(q.location ? { slug: q.location } : {}) },
    ...(slug ? { slug } : {}),
  };
  const rows = await db.property.findMany({
    where,
    include: {
      location: true,
      units: {
        where: { isActive: true },
        select: { id: true, isEntireProperty: true, isActive: true },
      },
      media: {
        orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
        ...(slug ? {} : { take: 1 }),
      },
      amenities: true,
      externalListings: slug
        ? { where: { isVisible: true, verifiedAt: { not: null } } }
        : false,
    },
    orderBy: { name: "asc" },
    take: 200,
  });
  if (slug && !rows.length)
    throw new AppError(
      404,
      "RESOURCE_NOT_FOUND",
      "This property is not available to view.",
    );
  const conflicts =
    q.checkIn && q.checkOut
      ? await db.availabilityBlock.findMany({
          where: {
            unitId: { in: rows.flatMap((p) => p.units.map((u) => u.id)) },
            startDate: { lt: toDate(q.checkOut) },
            endDate: { gt: toDate(q.checkIn) },
          },
          select: { unitId: true },
        })
      : [];
  const blocked = new Set(conflicts.map((b) => b.unitId));
  const s = await settings();
  return rows
    .map((p) => {
      const state = availability(eligibleUnits(p), blocked, !!q.checkIn);
      if (p.inventoryReviewRequired) state.status = "UNAVAILABLE";
      const { units: _units, whatsappNumber, ...safe } = p;
      const wa = p.isDemo
        ? null
        : whatsapp({
            number: whatsappNumber,
            fallback: s.defaultWhatsappNumber,
            name: p.name,
            location: p.location.name,
            url: `${env.APP_ORIGIN}/properties/${p.slug}`,
            checkIn: q.checkIn,
            checkOut: q.checkOut,
            unavailable: state.status === "UNAVAILABLE",
          });
      if (slug) return { ...safe, availability: state, whatsappUrl: wa };
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        location: p.location,
        area: p.area,
        propertyType: p.propertyType,
        shortDescription: p.shortDescription,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        beds: p.beds,
        maxGuests: p.maxGuests,
        amenities: p.amenities.slice(0, 3),
        media: p.media,
        isDemo: p.isDemo,
        availability: state,
      };
    })
    .sort(
      (a, b) =>
        Number(b.availability.status === "AVAILABLE") -
        Number(a.availability.status === "AVAILABLE"),
    );
}
export type SearchInput = z.infer<typeof searchSchema>;
