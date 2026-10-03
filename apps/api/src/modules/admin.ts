import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { AppError, found } from "../lib/errors.js";
import { toDate } from "../lib/dates.js";
import {
  idSchema,
  locationSchema,
  unitSchema,
  blockSchema,
  settingsSchema,
  proofSchema,
} from "./schemas.js";
import {
  adminLists,
  createReservation,
  updateEnquiryStatus,
  updateOwnerLeadStatus,
  updateReservationStatus,
} from "./enquiries.js";
import {
  include,
  saveProperty,
  transition,
  settings,
  ensurePublishable,
} from "./properties.js";
import { setInventoryMode, addRoom } from "./inventory.js";
import { publishErrors } from "./properties.js";
import {
  signature,
  registerMedia,
  updateMedia,
  reorderMedia,
  deleteMedia,
} from "./media.js";
export const admin = Router();
admin.use((req, res, next) => {
  if (!req.session.admin)
    return next(
      new AppError(401, "AUTH_REQUIRED", "Please sign in to continue."),
    );
  next();
});
admin.get("/properties", async (req, res) => {
  const data = await db.property.findMany({
    include,
    orderBy: { updatedAt: "desc" },
  });
  res.json({ data });
});
admin.get("/phase1", async (_req, res) =>
  res.json({ data: await adminLists() }),
);
admin.patch("/enquiries/:id/status", async (req, res) =>
  res.json({
    data: await updateEnquiryStatus(idSchema.parse(req.params.id), req.body),
  }),
);
admin.post("/reservations", async (req, res) =>
  res.status(201).json({ data: await createReservation(req.body) }),
);
admin.patch("/reservations/:id/status", async (req, res) =>
  res.json({
    data: await updateReservationStatus(idSchema.parse(req.params.id), req.body),
  }),
);
admin.post("/enquiries/:id/reservation", async (req, res) =>
  res.status(201).json({
    data: await createReservation({
      ...req.body,
      enquiryId: idSchema.parse(req.params.id),
    }),
  }),
);
admin.patch("/owner-leads/:id/status", async (req, res) =>
  res.json({
    data: await updateOwnerLeadStatus(idSchema.parse(req.params.id), req.body),
  }),
);
admin.get("/properties/:id", async (req, res) =>
  res.json({
    data: found(
      await db.property.findUnique({
        where: { id: idSchema.parse(req.params.id) },
        include,
      }),
    ),
  }),
);
admin.post("/properties", async (req, res) =>
  res.status(201).json({ data: await saveProperty(req.body) }),
);
admin.patch("/properties/:id", async (req, res) =>
  res.json({
    data: await saveProperty(req.body, idSchema.parse(req.params.id)),
  }),
);
for (const [action, status] of Object.entries({
  publish: "PUBLISHED",
  unpublish: "DRAFT",
  archive: "ARCHIVED",
} as const))
  admin.post(`/properties/:id/${action}`, async (req, res) =>
    res.json({ data: await transition(idSchema.parse(req.params.id), status) }),
  );
admin.get("/locations", async (req, res) =>
  res.json({ data: await db.location.findMany({ orderBy: { name: "asc" } }) }),
);
admin.post("/locations", async (req, res) =>
  res
    .status(201)
    .json({
      data: await db.location.create({ data: locationSchema.parse(req.body) }),
    }),
);
admin.patch("/locations/:id", async (req, res) => {
  const id = idSchema.parse(req.params.id),
    data = locationSchema.parse(req.body);
  const result = await db.$transaction(
    async (tx) => {
      if (
        !data.isActive &&
        (await tx.property.count({
          where: { locationId: id, status: "PUBLISHED" },
        }))
      )
        throw new AppError(
          409,
          "LOCATION_IN_USE",
          "Unpublish properties before disabling their location.",
        );
      return tx.location.update({ where: { id }, data });
    },
    { isolationLevel: "Serializable" },
  );
  res.json({ data: result });
});
admin.get("/amenities", async (req, res) =>
  res.json({ data: await db.amenity.findMany({ orderBy: { name: "asc" } }) }),
);
admin.post("/amenities", async (req, res) =>
  res.status(201).json({
    data: await db.amenity.create({
      data: z
        .object({
          name: z.string().trim().min(2).max(80),
          slug: z
            .string()
            .regex(/^[a-z0-9-]+$/)
            .max(80),
        })
        .strict()
        .parse(req.body),
    }),
  }),
);
admin.post("/properties/:id/units", async (req, res) =>
  res
    .status(201)
    .json({
      data: await addRoom(
        idSchema.parse(req.params.id),
        unitSchema.parse(req.body),
      ),
    }),
);
admin.patch("/properties/:id/inventory", async (req, res) => {
  const b = z
    .object({
      mode: z.enum(["ENTIRE_PROPERTY", "MULTI_UNIT"]),
      confirmReview: z.boolean().default(false),
    })
    .strict()
    .parse(req.body);
  res.json({
    data: await setInventoryMode(
      idSchema.parse(req.params.id),
      b.mode,
      b.confirmReview,
    ),
  });
});
admin.get("/properties/:id/readiness", async (req, res) => {
  const p = found(
    await db.property.findUnique({
      where: { id: idSchema.parse(req.params.id) },
      include,
    }),
  );
  const s = await settings();
  res.json({
    data: {
      errors: publishErrors(p, s.defaultWhatsappNumber),
      ready: publishErrors(p, s.defaultWhatsappNumber).length === 0,
    },
  });
});
admin.get("/properties/:id/preview", async (req, res) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  const p = found(
    await db.property.findUnique({
      where: { id: idSchema.parse(req.params.id) },
      include,
    }),
  );
  res.json({
    data: {
      ...p,
      externalListings: p.externalListings.filter(
        (e) => e.isVisible && e.verifiedAt,
      ),
      availability: { status: "NOT_EVALUATED" },
      whatsappUrl: null,
    },
  });
});
admin.patch("/units/:id", async (req, res) => {
  const id = idSchema.parse(req.params.id),
    data = unitSchema.parse(req.body);
  const unit = await db.$transaction(
    async (tx) => {
      const old = found(
        await tx.unit.findUnique({
          where: { id },
          include: { property: true },
        }),
      );
      if (old.isEntireProperty || old.property.inventoryMode !== "MULTI_UNIT")
        throw new AppError(
          409,
          "MANAGED_INVENTORY",
          "Whole-property inventory is managed automatically.",
        );
      const unit = await tx.unit.update({
        where: { id },
        data,
        include: { property: true },
      });
      if (unit.property.status === "PUBLISHED")
        await ensurePublishable(tx, unit.propertyId);
      return unit;
    },
    { isolationLevel: "Serializable" },
  );
  res.json({ data: unit });
});
admin.get("/units/:id/availability-blocks", async (req, res) =>
  res.json({
    data: await db.availabilityBlock.findMany({
      where: { unitId: idSchema.parse(req.params.id) },
      orderBy: { startDate: "asc" },
    }),
  }),
);
admin.post("/units/:id/availability-blocks", async (req, res) => {
  const unitId = idSchema.parse(req.params.id),
    b = blockSchema.parse(req.body);
  const data = {
    ...b,
    unitId,
    startDate: toDate(b.startDate),
    endDate: toDate(b.endDate),
  };
  const u = found(
    await db.unit.findUnique({
      where: { id: unitId },
      include: { property: true },
    }),
  );
  if (
    !u.isActive ||
    (u.property.inventoryMode === "MULTI_UNIT" && u.isEntireProperty)
  )
    throw new AppError(
      409,
      "INACTIVE_ROOM",
      "Choose an active room to block nights.",
    );
  const conflicts = await db.availabilityBlock.count({
    where: {
      unitId,
      startDate: { lt: data.endDate },
      endDate: { gt: data.startDate },
    },
  });
  const block = await db.availabilityBlock.create({ data });
  res
    .status(201)
    .json({
      data: block,
      meta: {
        warning: conflicts
          ? "This range overlaps an existing block. Both blocks will remain active."
          : null,
      },
    });
});
admin.delete("/availability-blocks/:id", async (req, res) => {
  await db.availabilityBlock.delete({
    where: { id: idSchema.parse(req.params.id) },
  });
  res.status(204).end();
});
admin.get("/settings", async (req, res) =>
  res.json({ data: await settings() }),
);
admin.patch("/settings", async (req, res) => {
  const data = settingsSchema.parse(req.body);
  const result = await db.$transaction(
    async (tx) => {
      if (
        !data.defaultWhatsappNumber &&
        (await tx.property.count({
          where: { status: "PUBLISHED", isDemo: false, whatsappNumber: "" },
        }))
      )
        throw new AppError(
          409,
          "CONTACT_IN_USE",
          "Published properties use this WhatsApp fallback. Add their own numbers first.",
        );
      return tx.siteSettings.upsert({
        where: { id: 1 },
        create: { id: 1, ...data },
        update: data,
      });
    },
    { isolationLevel: "Serializable" },
  );
  res.json({ data: result });
});
admin.post("/media/signature", async (req, res) =>
  res.json({ data: await signature(idSchema.parse(req.body.propertyId)) }),
);
admin.post("/properties/:id/media", async (req, res) =>
  res
    .status(201)
    .json({
      data: await registerMedia(idSchema.parse(req.params.id), req.body),
    }),
);
admin.patch("/properties/:id/media/order", async (req, res) => {
  await reorderMedia(idSchema.parse(req.params.id), req.body);
  res.status(204).end();
});
admin.patch("/properties/:id/media/:mediaId", async (req, res) =>
  res.json({
    data: await updateMedia(
      idSchema.parse(req.params.id),
      idSchema.parse(req.params.mediaId),
      req.body,
    ),
  }),
);
admin.delete("/properties/:id/media/:mediaId", async (req, res) => {
  await deleteMedia(
    idSchema.parse(req.params.id),
    idSchema.parse(req.params.mediaId),
  );
  res.status(204).end();
});
admin.post("/properties/:id/proofs", async (req, res) => {
  const b = proofSchema.parse(req.body);
  res
    .status(201)
    .json({
      data: await db.externalListing.create({
        data: {
          ...b,
          propertyId: idSchema.parse(req.params.id),
          verifiedAt: b.verifiedAt ? toDate(b.verifiedAt) : null,
        },
      }),
    });
});
admin.delete("/properties/:id/proofs/:proofId", async (req, res) => {
  const p = found(
    await db.externalListing.findFirst({
      where: {
        id: idSchema.parse(req.params.proofId),
        propertyId: idSchema.parse(req.params.id),
      },
    }),
  );
  await db.externalListing.delete({ where: { id: p.id } });
  res.status(204).end();
});
