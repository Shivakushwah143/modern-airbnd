import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { AppError } from "../lib/errors.js";
import { idSchema } from "./schemas.js";

/** URL-safe slug rules shared by the admin form and the public renderer. */
export const cmsSlug = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only.");

export const cmsPageInput = z.object({
  slug: cmsSlug,
  title: z.string().trim().min(1).max(160),
  body: z.string().max(20000).default(""),
  seoTitle: z.string().trim().max(170).default(""),
  seoDescription: z.string().trim().max(300).default(""),
  isPublished: z.boolean().default(false),
});

const pageSelect = {
  slug: true,
  title: true,
  body: true,
  seoTitle: true,
  seoDescription: true,
} as const;

export const cmsPublic = Router();

cmsPublic.get("/cms/pages", async (_req, res) =>
  res.json({
    data: await db.cmsPage.findMany({
      where: { isPublished: true },
      orderBy: { slug: "asc" },
      select: { slug: true, title: true },
    }),
  }),
);

cmsPublic.get("/cms/pages/:slug", async (req, res) => {
  const slug = String(req.params.slug);
  if (!cmsSlug.safeParse(slug).success)
    throw new AppError(404, "RESOURCE_NOT_FOUND", "Page not found.");
  const page = await db.cmsPage.findFirst({
    where: { slug, isPublished: true },
    select: pageSelect,
  });
  if (!page)
    throw new AppError(404, "RESOURCE_NOT_FOUND", "Page not found.");
  res.json({ data: page });
});

export const cmsAdmin = Router();
cmsAdmin.use((req, res, next) => {
  if (!req.session.admin)
    return next(
      new AppError(401, "AUTH_REQUIRED", "Please sign in to continue."),
    );
  next();
});

cmsAdmin.get("/cms/pages", async (_req, res) =>
  res.json({ data: await db.cmsPage.findMany({ orderBy: { slug: "asc" } }) }),
);

cmsAdmin.post("/cms/pages", async (req, res) =>
  res
    .status(201)
    .json({ data: await db.cmsPage.create({ data: cmsPageInput.parse(req.body) }) }),
);

cmsAdmin.patch("/cms/pages/:id", async (req, res) =>
  res.json({
    data: await db.cmsPage.update({
      where: { id: idSchema.parse(req.params.id) },
      data: cmsPageInput.partial().parse(req.body),
    }),
  }),
);

cmsAdmin.delete("/cms/pages/:id", async (req, res) => {
  await db.cmsPage.delete({ where: { id: idSchema.parse(req.params.id) } });
  res.status(204).end();
});