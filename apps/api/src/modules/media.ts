import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "../db.js";
import { env } from "../config/env.js";
import { AppError, found } from "../lib/errors.js";
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});
function configured() {
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  )
    throw new AppError(
      503,
      "MEDIA_NOT_CONFIGURED",
      "Image uploads are not configured. Add Cloudinary credentials on the server.",
    );
}
export async function signature(propertyId: string) {
  configured();
  found(await db.property.findUnique({ where: { id: propertyId } }));
  const params = {
    timestamp: Math.floor(Date.now() / 1000),
    public_id: `modern-airbnd/properties/${propertyId}/${randomUUID()}`,
    overwrite: false,
    allowed_formats: "jpg,jpeg,png,webp",
    type: "upload",
  };
  return {
    ...params,
    signature: cloudinary.utils.api_sign_request(
      params,
      env.CLOUDINARY_API_SECRET,
    ),
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
  };
}
export async function registerMedia(propertyId: string, body: unknown) {
  configured();
  const b = z
    .object({
      publicId: z.string().max(300),
      altText: z.string().trim().min(3).max(300),
    })
    .strict()
    .parse(body);
  if (!b.publicId.startsWith(`modern-airbnd/properties/${propertyId}/`))
    throw new AppError(
      400,
      "MEDIA_UPLOAD_INVALID",
      "The image does not belong to this property.",
    );
  found(await db.property.findUnique({ where: { id: propertyId } }));
  // Query Cloudinary independently; never trust browser-supplied metadata or URLs.
  const asset = await cloudinary.api.resource(b.publicId, {
    resource_type: "image",
    type: "upload",
  });
  if (
    !["jpg", "jpeg", "png", "webp"].includes(asset.format) ||
    asset.bytes > 10 * 1024 * 1024 ||
    asset.resource_type !== "image" ||
    !asset.secure_url.startsWith(
      `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/`,
    )
  )
    throw new AppError(
      400,
      "MEDIA_UPLOAD_INVALID",
      "Upload a JPEG, PNG or WebP image smaller than 10 MB.",
    );
  return db.$transaction(
    async (tx) => {
      const count = await tx.propertyMedia.count({ where: { propertyId } });
      if (count >= 40)
        throw new AppError(
          422,
          "MEDIA_LIMIT",
          "A property can have up to 40 images.",
        );
      return tx.propertyMedia.create({
        data: {
          propertyId,
          cloudinaryPublicId: b.publicId,
          secureUrl: asset.secure_url,
          format: asset.format,
          width: asset.width,
          height: asset.height,
          bytes: asset.bytes,
          altText: b.altText,
          sortOrder: count,
          isCover: count === 0,
        },
      });
    },
    { isolationLevel: "Serializable" },
  );
}
export async function updateMedia(
  propertyId: string,
  id: string,
  body: unknown,
) {
  const data = z
    .object({
      altText: z.string().trim().min(3).max(300).optional(),
      isCover: z.literal(true).optional(),
    })
    .strict()
    .parse(body);
  return db.$transaction(
    async (tx) => {
      found(await tx.propertyMedia.findFirst({ where: { id, propertyId } }));
      if (data.isCover)
        await tx.propertyMedia.updateMany({
          where: { propertyId },
          data: { isCover: false },
        });
      return tx.propertyMedia.update({ where: { id }, data });
    },
    { isolationLevel: "Serializable" },
  );
}
export async function reorderMedia(propertyId: string, body: unknown) {
  const { ids } = z
    .object({ ids: z.array(z.string().uuid()).max(40) })
    .strict()
    .parse(body);
  return db.$transaction(
    async (tx) => {
      const existing = await tx.propertyMedia.findMany({
        where: { propertyId },
        select: { id: true },
      });
      if (
        new Set(ids).size !== ids.length ||
        existing.length !== ids.length ||
        existing.some((m) => !ids.includes(m.id))
      )
        throw new AppError(
          400,
          "MEDIA_ORDER_INVALID",
          "Include every image exactly once.",
        );
      for (const [sortOrder, id] of ids.entries())
        await tx.propertyMedia.update({ where: { id }, data: { sortOrder } });
    },
    { isolationLevel: "Serializable" },
  );
}
export async function deleteMedia(propertyId: string, id: string) {
  configured();
  // Keep the metadata until Cloudinary confirms deletion. Transaction guards concurrent last-photo removal.
  return db.$transaction(
    async (tx) => {
      const m = found(
        await tx.propertyMedia.findFirst({
          where: { id, propertyId },
          include: { property: true },
        }),
      );
      if (
        m.property.status === "PUBLISHED" &&
        (await tx.propertyMedia.count({ where: { propertyId } })) <= 1
      )
        throw new AppError(
          422,
          "LAST_PUBLISHED_IMAGE",
          "Unpublish the property before removing its final photo.",
        );
      const result = await cloudinary.uploader.destroy(m.cloudinaryPublicId, {
        resource_type: "image",
        invalidate: true,
      });
      if (!["ok", "not found"].includes(result.result))
        throw new AppError(
          502,
          "MEDIA_DELETE_FAILED",
          "The image could not be deleted. Please retry.",
        );
      await tx.propertyMedia.delete({ where: { id } });
      if (m.isCover) {
        const next = await tx.propertyMedia.findFirst({
          where: { propertyId },
          orderBy: { sortOrder: "asc" },
        });
        if (next)
          await tx.propertyMedia.update({
            where: { id: next.id },
            data: { isCover: true },
          });
      }
    },
    { isolationLevel: "Serializable", timeout: 20000 },
  );
}
