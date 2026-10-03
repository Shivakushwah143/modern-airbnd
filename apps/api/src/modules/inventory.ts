import { Prisma, type InventoryMode } from "@prisma/client";
import { db } from "../db.js";
import { AppError, found } from "../lib/errors.js";
type Inventory = {
  inventoryMode: InventoryMode;
  inventoryReviewRequired?: boolean;
  units: { id: string; isActive: boolean; isEntireProperty: boolean }[];
};
export function eligibleUnits(p: Inventory) {
  return p.units.filter(
    (u) =>
      u.isActive &&
      (p.inventoryMode === "ENTIRE_PROPERTY"
        ? u.isEntireProperty
        : !u.isEntireProperty),
  );
}
export function inventoryErrors(p: Inventory) {
  const active = p.units.filter((u) => u.isActive),
    eligible = eligibleUnits(p);
  const errors: string[] = [];
  if (p.inventoryReviewRequired)
    errors.push("Review how this property is offered before publishing.");
  if (
    p.inventoryMode === "ENTIRE_PROPERTY" &&
    (eligible.length !== 1 || active.length !== 1)
  )
    errors.push(
      "Entire-property stays need exactly one active whole-property inventory.",
    );
  if (
    p.inventoryMode === "MULTI_UNIT" &&
    (!eligible.length || active.some((u) => u.isEntireProperty))
  )
    errors.push(
      "Add at least one active room. Whole-property inventory cannot be active in room mode.",
    );
  return errors;
}
async function inheritBlocks(
  tx: Prisma.TransactionClient,
  sourceIds: string[],
  targetIds: string[],
) {
  const blocks = await tx.availabilityBlock.findMany({
    where: { unitId: { in: sourceIds } },
  });
  for (const unitId of targetIds) {
    await tx.availabilityBlock.createMany({
      data: blocks
        .filter((b) => b.unitId !== unitId)
        .map((b) => ({
          unitId,
          startDate: b.startDate,
          endDate: b.endDate,
          reason: b.reason,
          note: b.note,
          sourceBlockId: b.sourceBlockId || b.id,
        })),
      skipDuplicates: true,
    });
  }
}
export async function setInventoryMode(
  id: string,
  mode: InventoryMode,
  confirmReview: boolean,
) {
  return db.$transaction(
    async (tx) => {
      const p = found(
        await tx.property.findUnique({
          where: { id },
          include: { units: true },
        }),
      );
      if (p.status === "PUBLISHED")
        throw new AppError(
          409,
          "UNPUBLISH_FIRST",
          "Unpublish before changing how guests can stay.",
        );
      if (p.inventoryReviewRequired && !confirmReview)
        throw new AppError(
          409,
          "REVIEW_REQUIRED",
          "Confirm that you have reviewed the existing rooms and blocks.",
        );
      let whole = p.units.find((u) => u.isEntireProperty);
      if (!whole)
        whole = await tx.unit.create({
          data: {
            propertyId: id,
            name: "Entire Property",
            isEntireProperty: true,
            isActive: false,
          },
        });
      const rooms = p.units.filter((u) => !u.isEntireProperty);
      if (mode === "ENTIRE_PROPERTY") {
        await inheritBlocks(
          tx,
          p.units
            .filter((u) => u.isActive || p.inventoryReviewRequired)
            .map((u) => u.id),
          [whole.id],
        );
        await tx.unit.updateMany({
          where: { propertyId: id },
          data: { isActive: false },
        });
        await tx.unit.update({
          where: { id: whole.id },
          data: { isActive: true },
        });
      } else {
        await inheritBlocks(
          tx,
          [whole.id],
          rooms.filter((u) => u.isActive).map((u) => u.id),
        );
        await tx.unit.update({
          where: { id: whole.id },
          data: { isActive: false },
        });
      }
      return tx.property.update({
        where: { id },
        data: { inventoryMode: mode, inventoryReviewRequired: false },
      });
    },
    { isolationLevel: "Serializable" },
  );
}
export async function addRoom(
  id: string,
  data: { name: string; isActive: boolean },
) {
  return db.$transaction(
    async (tx) => {
      const p = found(
        await tx.property.findUnique({
          where: { id },
          include: { units: true },
        }),
      );
      if (p.inventoryMode !== "MULTI_UNIT")
        throw new AppError(
          409,
          "ROOM_MODE_REQUIRED",
          "Choose individual rooms before adding a room.",
        );
      const room = await tx.unit.create({
        data: { ...data, propertyId: id, isEntireProperty: false },
      });
      await inheritBlocks(
        tx,
        p.units.filter((u) => u.isEntireProperty).map((u) => u.id),
        [room.id],
      );
      return room;
    },
    { isolationLevel: "Serializable" },
  );
}
