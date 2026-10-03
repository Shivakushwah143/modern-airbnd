import { Router } from "express";
import { db } from "../db.js";
import { toDate } from "../lib/dates.js";
import { AppError, found } from "../lib/errors.js";
import {
  housekeepingStatusSchema,
  housekeepingTaskSchema,
  idSchema,
  maintenanceIssueSchema,
  maintenanceStatusSchema,
  ownerSchema,
  propertyOwnerSchema,
  stayActionSchema,
} from "./schemas.js";

export const operations = Router();

function todayInIndia() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const propertyLabel = { select: { id: true, name: true, slug: true, status: true } };
const reservationInclude = { property: propertyLabel };

export async function dashboard(date = todayInIndia()) {
  const day = toDate(date);
  const tomorrow = new Date(day);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const [
    totalProperties,
    publishedProperties,
    todaysCheckIns,
    todaysCheckOuts,
    upcomingStays,
    newGuestEnquiries,
    newOwnerLeads,
    pendingHousekeeping,
    openMaintenance,
  ] = await Promise.all([
    db.property.count(),
    db.property.count({ where: { status: "PUBLISHED" } }),
    db.reservation.count({ where: { status: "CONFIRMED", checkIn: day } }),
    db.reservation.count({ where: { status: "CONFIRMED", checkOut: day } }),
    db.reservation.count({
      where: { status: "CONFIRMED", checkIn: { gt: day } },
    }),
    db.enquiry.count({ where: { status: "NEW" } }),
    db.ownerLead.count({ where: { status: "NEW" } }),
    db.housekeepingTask.count({
      where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
    }),
    db.maintenanceIssue.count({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
  ]);
  const [arrivals, departures, upcoming] = await Promise.all([
    db.reservation.findMany({
      where: { status: "CONFIRMED", checkIn: day },
      include: reservationInclude,
      orderBy: { updatedAt: "desc" },
    }),
    db.reservation.findMany({
      where: { status: "CONFIRMED", checkOut: day },
      include: reservationInclude,
      orderBy: { updatedAt: "desc" },
    }),
    db.reservation.findMany({
      where: { status: "CONFIRMED", checkIn: { gt: day } },
      include: reservationInclude,
      orderBy: { checkIn: "asc" },
      take: 20,
    }),
  ]);
  return {
    date,
    counts: {
      totalProperties,
      publishedProperties,
      todaysCheckIns,
      todaysCheckOuts,
      upcomingStays,
      newGuestEnquiries,
      newOwnerLeads,
      pendingHousekeeping,
      openMaintenance,
    },
    arrivals,
    departures,
    upcoming,
  };
}

export async function markStay(id: string, action: "check-in" | "check-out", body: unknown) {
  const { notes } = stayActionSchema.parse(body);
  return db.$transaction(async (tx) => {
    const r = found(await tx.reservation.findUnique({ where: { id } }));
    if (r.status !== "CONFIRMED")
      throw new AppError(409, "INVALID_RESERVATION_STATUS", "Only confirmed reservations can be updated for stay status.");
    if (action === "check-in") {
      if (r.stayStatus !== "RESERVED")
        throw new AppError(409, "INVALID_STAY_STATUS", "Only reserved stays can be checked in.");
      return tx.reservation.update({
        where: { id },
        data: {
          stayStatus: "CHECKED_IN",
          checkedInAt: new Date(),
          operationalNotes: notes || r.operationalNotes,
        },
      });
    }
    if (r.stayStatus !== "CHECKED_IN")
      throw new AppError(409, "INVALID_STAY_STATUS", "Only checked-in stays can be checked out.");
    return tx.reservation.update({
      where: { id },
      data: {
        stayStatus: "CHECKED_OUT",
        checkedOutAt: new Date(),
        operationalNotes: notes || r.operationalNotes,
      },
    });
  });
}

operations.get("/dashboard", async (_req, res) =>
  res.json({ data: await dashboard() }),
);
operations.get("/owners", async (req, res) => {
  const q = String(req.query.q || "").trim();
  res.json({
    data: await db.owner.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      include: { properties: propertyLabel },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
  });
});
operations.post("/owners", async (req, res) =>
  res.status(201).json({ data: await db.owner.create({ data: ownerSchema.parse(req.body) }) }),
);
operations.patch("/owners/:id", async (req, res) =>
  res.json({
    data: await db.owner.update({
      where: { id: idSchema.parse(req.params.id) },
      data: ownerSchema.parse(req.body),
      include: { properties: propertyLabel },
    }),
  }),
);
operations.patch("/properties/:id/owner", async (req, res) => {
  const { ownerId } = propertyOwnerSchema.parse(req.body);
  res.json({
    data: await db.property.update({
      where: { id: idSchema.parse(req.params.id) },
      data: { ownerId },
    }),
  });
});
operations.post("/reservations/:id/check-in", async (req, res) =>
  res.json({ data: await markStay(idSchema.parse(req.params.id), "check-in", req.body) }),
);
operations.post("/reservations/:id/check-out", async (req, res) =>
  res.json({ data: await markStay(idSchema.parse(req.params.id), "check-out", req.body) }),
);
operations.get("/housekeeping", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  res.json({
    data: await db.housekeepingTask.findMany({
      where: status ? { status: status as never } : {},
      include: { property: propertyLabel, reservation: { select: { id: true, guestName: true, checkOut: true } } },
      orderBy: { dueDate: "asc" },
      take: 100,
    }),
  });
});
operations.post("/housekeeping", async (req, res) => {
  const b = housekeepingTaskSchema.parse(req.body);
  res.status(201).json({
    data: await db.housekeepingTask.create({
      data: { ...b, dueDate: toDate(b.dueDate) },
    }),
  });
});
operations.patch("/housekeeping/:id", async (req, res) => {
  const b = housekeepingTaskSchema.partial().parse(req.body);
  res.json({
    data: await db.housekeepingTask.update({
      where: { id: idSchema.parse(req.params.id) },
      data: { ...b, ...(b.dueDate ? { dueDate: toDate(b.dueDate) } : {}) },
    }),
  });
});
operations.patch("/housekeeping/:id/status", async (req, res) =>
  res.json({
    data: await db.housekeepingTask.update({
      where: { id: idSchema.parse(req.params.id) },
      data: housekeepingStatusSchema.parse(req.body),
    }),
  }),
);
operations.get("/maintenance", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  res.json({
    data: await db.maintenanceIssue.findMany({
      where: status ? { status: status as never } : {},
      include: { property: propertyLabel },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
      take: 100,
    }),
  });
});
operations.post("/maintenance", async (req, res) =>
  res.status(201).json({
    data: await db.maintenanceIssue.create({
      data: maintenanceIssueSchema.parse(req.body),
    }),
  }),
);
operations.patch("/maintenance/:id", async (req, res) =>
  res.json({
    data: await db.maintenanceIssue.update({
      where: { id: idSchema.parse(req.params.id) },
      data: maintenanceIssueSchema.partial().parse(req.body),
    }),
  }),
);
operations.patch("/maintenance/:id/status", async (req, res) =>
  res.json({
    data: await db.maintenanceIssue.update({
      where: { id: idSchema.parse(req.params.id) },
      data: maintenanceStatusSchema.parse(req.body),
    }),
  }),
);
