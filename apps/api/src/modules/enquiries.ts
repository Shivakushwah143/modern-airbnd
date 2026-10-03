import { type Prisma } from "@prisma/client";
import { Router } from "express";
import { db } from "../db.js";
import { toDate } from "../lib/dates.js";
import { AppError, found } from "../lib/errors.js";
import { whatsapp } from "../lib/whatsapp.js";
import { env } from "../config/env.js";
import { eligibleUnits } from "./inventory.js";
import { settings } from "./properties.js";
import {
  enquiryStatusSchema,
  ownerLeadSchema,
  ownerLeadStatusSchema,
  reservationSchema,
  reservationStatusSchema,
  stayEnquirySchema,
} from "./schemas.js";

export const publicEnquiries = Router();

async function upsertGuest(
  tx: Prisma.TransactionClient,
  input: { guestName: string; phone: string },
) {
  return tx.guest.upsert({
    where: { phone: input.phone },
    create: { name: input.guestName, phone: input.phone },
    update: { name: input.guestName },
  });
}

async function assertCapacity(
  tx: Prisma.TransactionClient,
  propertyId: string,
  guests: number,
  requirePublished = false,
) {
  const property = found(
    await tx.property.findUnique({
      where: { id: propertyId },
      include: { units: true, location: true },
    }),
  );
  if (requirePublished && property.status !== "PUBLISHED")
    throw new AppError(404, "RESOURCE_NOT_FOUND", "Property not found.");
  if (guests > property.maxGuests)
    throw new AppError(
      422,
      "CAPACITY_EXCEEDED",
      `This property allows up to ${property.maxGuests} guests.`,
    );
  return property;
}

export async function createReservation(body: unknown) {
  const b = reservationSchema.parse(body);
  return db.$transaction(
    async (tx) => {
      const property = await assertCapacity(tx, b.propertyId, b.adults + b.children);
      const guest = await upsertGuest(tx, b);
      let blockId: string | null = null;
      let unitId: string | null = null;
      const checkIn = toDate(b.checkIn);
      const checkOut = toDate(b.checkOut);
      if (b.status === "CONFIRMED") {
        const units = eligibleUnits(property);
        const conflicts = await tx.availabilityBlock.findMany({
          where: {
            unitId: { in: units.map((u) => u.id) },
            startDate: { lt: checkOut },
            endDate: { gt: checkIn },
          },
          select: { unitId: true },
        });
        const blocked = new Set(conflicts.map((c) => c.unitId));
        const unit = units.find((u) => !blocked.has(u.id));
        if (!unit)
          throw new AppError(409, "NO_AVAILABILITY", "No eligible inventory is available for these dates.");
        const block = await tx.availabilityBlock.create({
          data: {
            unitId: unit.id,
            startDate: checkIn,
            endDate: checkOut,
            reason: "BOOKED",
            note: `Reservation: ${b.guestName} (${b.source})`,
          },
        });
        blockId = block.id;
        unitId = unit.id;
      }
      const reservation = await tx.reservation.create({
        data: {
          propertyId: b.propertyId,
          enquiryId: b.enquiryId,
          guestId: guest.id,
          source: b.source,
          status: b.status,
          checkIn,
          checkOut,
          adults: b.adults,
          children: b.children,
          guestName: b.guestName,
          phone: b.phone,
          notes: b.notes,
          unitId,
          availabilityBlockId: blockId,
        },
      });
      if (b.enquiryId)
        await tx.enquiry.update({
          where: { id: b.enquiryId },
          data: { status: b.status === "CONFIRMED" ? "CONFIRMED" : "NEGOTIATING" },
        });
      return reservation;
    },
    { isolationLevel: "Serializable" },
  );
}

publicEnquiries.post("/enquiries", async (req, res) => {
  const b = stayEnquirySchema.parse(req.body);
  const result = await db.$transaction(
    async (tx) => {
      const property = await assertCapacity(tx, b.propertyId, b.adults + b.children, true);
      const guest = await upsertGuest(tx, b);
      const enquiry = await tx.enquiry.create({
        data: {
          propertyId: b.propertyId,
          guestId: guest.id,
          checkIn: toDate(b.checkIn),
          checkOut: toDate(b.checkOut),
          adults: b.adults,
          children: b.children,
          guestName: b.guestName,
          phone: b.phone,
          message: b.message,
        },
      });
      const s = await settings();
      return {
        enquiry,
        whatsappUrl: whatsapp({
          number: property.whatsappNumber,
          fallback: s.defaultWhatsappNumber,
          name: property.name,
          location: property.location.name,
          url: `${env.APP_ORIGIN}/properties/${property.slug}`,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          adults: b.adults,
          children: b.children,
          guestName: b.guestName,
          phone: b.phone,
          message: b.message,
        }),
      };
    },
    { isolationLevel: "Serializable" },
  );
  res.status(201).json({ data: result });
});

publicEnquiries.post("/owner-leads", async (req, res) => {
  const b = ownerLeadSchema.parse(req.body);
  res.status(201).json({ data: await db.ownerLead.create({ data: b }) });
});

export async function adminLists() {
  const [enquiries, reservations, guests, ownerLeads] = await Promise.all([
    db.enquiry.findMany({ include: { property: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.reservation.findMany({ include: { property: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.guest.findMany({ orderBy: { updatedAt: "desc" }, take: 100 }),
    db.ownerLead.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return { enquiries, reservations, guests, ownerLeads };
}

export async function updateEnquiryStatus(id: string, body: unknown) {
  return db.enquiry.update({
    where: { id },
    data: enquiryStatusSchema.parse(body),
  });
}

export async function updateOwnerLeadStatus(id: string, body: unknown) {
  return db.ownerLead.update({
    where: { id },
    data: ownerLeadStatusSchema.parse(body),
  });
}

export async function updateReservationStatus(id: string, body: unknown) {
  const { status } = reservationStatusSchema.parse(body);
  return db.$transaction(
    async (tx) => {
      const old = found(await tx.reservation.findUnique({ where: { id } }));
      let blockId = old.availabilityBlockId;
      let unitId = old.unitId;
      if (old.status !== "CONFIRMED" && status === "CONFIRMED") {
        const property = await assertCapacity(
          tx,
          old.propertyId,
          old.adults + old.children,
        );
        const units = eligibleUnits(property);
        const conflicts = await tx.availabilityBlock.findMany({
          where: {
            unitId: { in: units.map((u) => u.id) },
            startDate: { lt: old.checkOut },
            endDate: { gt: old.checkIn },
          },
          select: { unitId: true },
        });
        const blocked = new Set(conflicts.map((c) => c.unitId));
        const unit = units.find((u) => !blocked.has(u.id));
        if (!unit)
          throw new AppError(
            409,
            "NO_AVAILABILITY",
            "No eligible inventory is available for these dates.",
          );
        const block = await tx.availabilityBlock.create({
          data: {
            unitId: unit.id,
            startDate: old.checkIn,
            endDate: old.checkOut,
            reason: "BOOKED",
            note: `Reservation: ${old.guestName} (${old.source})`,
          },
        });
        blockId = block.id;
        unitId = unit.id;
      }
      const releaseBlock =
        old.status === "CONFIRMED" &&
        status !== "CONFIRMED" &&
        old.availabilityBlockId;
      if (releaseBlock)
        await tx.availabilityBlock.delete({
          where: { id: old.availabilityBlockId! },
        });
      return tx.reservation.update({
        where: { id },
        data: {
          status,
          unitId: releaseBlock ? null : unitId,
          availabilityBlockId: releaseBlock ? null : blockId,
        },
      });
    },
    { isolationLevel: "Serializable" },
  );
}
