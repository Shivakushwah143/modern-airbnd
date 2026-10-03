import { z } from "zod";
import { dateSchema } from "../lib/dates.js";
export const idSchema = z.string().uuid();
const text = (max = 200) => z.string().trim().max(max);
export const phone = z
  .string()
  .regex(
    /^(\+[1-9]\d{7,14})?$/,
    "Use international format, e.g. +91 followed by the number.",
  );
export const slugSchema = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const propertySchema = z
  .object({
    name: text().min(2),
    slug: slugSchema,
    locationId: idSchema,
    localHighlights: z
      .array(
        z.object({ name: text(100).min(1), detail: text(160).min(1) }).strict(),
      )
      .max(12)
      .default([]),
    suitedFor: z.array(text(80).min(1)).max(10).default([]),
    shortDescription: text(300).default(""),
    description: text(10000).default(""),
    propertyType: text(100).default("Entire apartment"),
    area: text().default(""),
    addressLine: text(500).default(""),
    latitude: z.number().min(-90).max(90).nullable().default(null),
    longitude: z.number().min(-180).max(180).nullable().default(null),
    bedrooms: z.number().int().min(0).max(100).default(1),
    bathrooms: z.number().int().min(0).max(100).default(1),
    beds: z.number().int().min(0).max(100).default(1),
    maxGuests: z.number().int().min(1).max(200).default(2),
    whatsappNumber: phone.default(""),
    houseRules: z.array(text(500)).max(30).default([]),
    checkInInfo: text().default(""),
    checkOutInfo: text().default(""),
    propertyNotes: text(3000).default(""),
    seoTitle: text(100).default(""),
    seoDescription: text(200).default(""),
    amenityIds: z.array(idSchema).max(50).default([]),
  })
  .strict();
export const locationSchema = z
  .object({
    name: text().min(2),
    slug: slugSchema,
    state: text().default(""),
    isActive: z.boolean().default(true),
  })
  .strict();
export const unitSchema = z
  .object({ name: text(100).min(1), isActive: z.boolean().default(true) })
  .strict();
export const blockSchema = z
  .object({
    startDate: dateSchema,
    endDate: dateSchema,
    reason: z
      .enum(["BOOKED", "MAINTENANCE", "OWNER_BLOCKED", "OTHER"])
      .default("OWNER_BLOCKED"),
    note: text(1000).default(""),
  })
  .strict()
  .refine((v) => v.endDate > v.startDate, {
    message: "End date must be after start date.",
    path: ["endDate"],
  });
export const settingsSchema = z
  .object({
    defaultWhatsappNumber: phone,
    supportPhone: phone,
    supportEmail: z.union([z.literal(""), z.string().email().max(200)]),
    businessAddress: text(500),
    operatorName: text(),
    aboutText: text(5000),
    privacyText: text(10000),
    termsText: text(10000),
  })
  .strict();
export const proofSchema = z
  .object({
    provider: text(80).min(1),
    url: z
      .string()
      .url()
      .max(2000)
      .refine((v) => v.startsWith("https://"), "Use an HTTPS source URL."),
    rating: z.number().min(0).max(5).nullable(),
    reviewCount: z.number().int().min(0).nullable(),
    verifiedAt: dateSchema.nullable(),
    isVisible: z.boolean(),
  })
  .strict()
  .refine((v) => !v.isVisible || v.verifiedAt !== null, {
    message: "Verify the source before displaying it.",
  });
export const stayEnquirySchema = z
  .object({
    propertyId: idSchema,
    checkIn: dateSchema,
    checkOut: dateSchema,
    adults: z.number().int().min(1).max(200),
    children: z.number().int().min(0).max(200).default(0),
    guestName: text(120).min(2),
    phone: phone.refine((v) => v.length > 0, "Phone is required."),
    message: text(1000).default(""),
  })
  .strict()
  .refine((v) => v.checkOut > v.checkIn, {
    message: "Check-out must be after check-in.",
    path: ["checkOut"],
  });
export const ownerLeadSchema = z
  .object({
    name: text(120).min(2),
    phone: phone.refine((v) => v.length > 0, "Phone is required."),
    email: z.union([z.literal(""), z.string().email().max(200)]).default(""),
    city: text(120).default(""),
    propertyType: text(120).default(""),
    message: text(1000).default(""),
  })
  .strict();
export const enquiryStatusSchema = z.object({
  status: z.enum([
    "NEW",
    "CONTACTED",
    "AVAILABLE",
    "NOT_AVAILABLE",
    "NEGOTIATING",
    "CONFIRMED",
    "CLOSED",
    "CANCELLED",
  ]),
});
export const reservationSchema = z
  .object({
    propertyId: idSchema,
    enquiryId: idSchema.nullable().default(null),
    source: z.enum([
      "WHATSAPP",
      "AIRBNB",
      "BOOKING_COM",
      "DIRECT",
      "REFERRAL",
      "OTHER",
    ]),
    status: z.enum(["TENTATIVE", "CONFIRMED", "CANCELLED", "CLOSED"]).default("CONFIRMED"),
    checkIn: dateSchema,
    checkOut: dateSchema,
    adults: z.number().int().min(1).max(200),
    children: z.number().int().min(0).max(200).default(0),
    guestName: text(120).min(2),
    phone: phone.refine((v) => v.length > 0, "Phone is required."),
    notes: text(1000).default(""),
  })
  .strict()
  .refine((v) => v.checkOut > v.checkIn, {
    message: "Check-out must be after check-in.",
    path: ["checkOut"],
  });
export const ownerLeadStatusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CLOSED", "CANCELLED"]),
});
export const reservationStatusSchema = z.object({
  status: z.enum(["TENTATIVE", "CONFIRMED", "CANCELLED", "CLOSED"]),
});
export const ownerSchema = z
  .object({
    name: text(120).min(2),
    phone: phone.refine((v) => v.length > 0, "Phone is required."),
    email: z.union([z.literal(""), z.string().email().max(200)]).default(""),
    notes: text(3000).default(""),
  })
  .strict();
export const propertyOwnerSchema = z
  .object({ ownerId: idSchema.nullable() })
  .strict();
export const stayActionSchema = z
  .object({ notes: text(1000).default("") })
  .strict();
export const housekeepingTaskSchema = z
  .object({
    propertyId: idSchema,
    reservationId: idSchema.nullable().default(null),
    assigneeName: text(120).default(""),
    dueDate: dateSchema,
    status: z
      .enum(["PENDING", "IN_PROGRESS", "DONE", "CANCELLED"])
      .default("PENDING"),
    notes: text(1000).default(""),
  })
  .strict();
export const housekeepingStatusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "DONE", "CANCELLED"]),
});
export const maintenanceIssueSchema = z
  .object({
    propertyId: idSchema,
    title: text(160).min(2),
    description: text(3000).default(""),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
    assigneeName: text(120).default(""),
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CANCELLED"]).default("OPEN"),
    cost: z.number().min(0).max(9999999999).nullable().default(null),
    notes: text(1000).default(""),
  })
  .strict();
export const maintenanceStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CANCELLED"]),
});
