import express from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { randomUUID } from "node:crypto";
import argon2 from "argon2";
import { z, ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { env } from "./config/env.js";
import { db, sessionPool } from "./db.js";
import { AppError, classifyDatabaseError } from "./lib/errors.js";
import { withReadRetry } from "./lib/read-retry.js";
import { logger } from "./lib/logger.js";
import { admin } from "./modules/admin.js";
import { publicEnquiries } from "./modules/enquiries.js";
import { operations } from "./modules/operations.js";
import { publicProperties, settings } from "./modules/properties.js";
import { portfolioAdmin, portfolioPublic } from "./modules/portfolio.js";
import { cmsAdmin, cmsPublic } from "./modules/cms.js";
import { idSchema } from "./modules/schemas.js";
declare module "express-session" {
  interface SessionData {
    admin?: boolean;
  }
}
export const app = express();
app.disable("x-powered-by");
app.set("trust proxy", env.TRUST_PROXY);
app.use(helmet());
app.use((req, res, next) => {
  const id = randomUUID();
  res.setHeader("X-Request-ID", id);
  res.locals.requestId = id;
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use(
  pinoHttp({
    logger,
    genReqId: (_req, res) => String(res.getHeader("X-Request-ID")),
    serializers: {
      req: (r) => ({ method: r.method, url: r.url?.split("?")[0] }),
      res: (r) => ({ statusCode: r.statusCode }),
    },
    customProps: (_req, res) => ({ requestId: res.getHeader("X-Request-ID") }),
  }),
);
app.use(express.json({ limit: "64kb" }));
app.get("/api/v1/health/live", (_req, res) =>
  res.json({ data: { status: "ok" } }),
);
function requestSignal(req: express.Request) {
  const controller = new AbortController();
  req.once("aborted", () => controller.abort());
  return controller.signal;
}

function databaseRead<T>(
  req: express.Request,
  res: express.Response,
  operation: string,
  run: () => Promise<T>,
) {
  res.locals.dbOperation = operation;
  return withReadRetry(run, {
    operation,
    requestId: res.locals.requestId,
    signal: requestSignal(req),
    deadlineMs: env.DB_READ_RETRY_DEADLINE_MS,
    maxAttempts: env.DB_READ_RETRY_MAX_ATTEMPTS,
  });
}

app.get("/api/v1/health/ready", async (_req, res) => {
  await db.$queryRaw`SELECT 1`;
  res.json({ data: { status: "ready" } });
});
app.use(
  "/api/v1",
  rateLimit({
    windowMs: 60000,
    limit: 240,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, _res, next) =>
      next(
        new AppError(
          429,
          "RATE_LIMITED",
          "Too many requests. Please try again shortly.",
        ),
      ),
  }),
);
const PgStore = connectPg(session);
app.use(
  "/api/v1/admin",
  session({
    store: new PgStore({
      pool: sessionPool,
      tableName: "admin_session",
      createTableIfMissing: false,
    }),
    name: "modern_airbnd.sid",
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: false,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: env.SESSION_MAX_AGE_MS,
      path: "/",
    },
  }),
);
app.use("/api/v1/admin", (req, _res, next) => {
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.get("origin") !== env.APP_ORIGIN
  )
    return next(
      new AppError(
        403,
        "ORIGIN_NOT_ALLOWED",
        "This request origin is not allowed.",
      ),
    );
  next();
});
app.post(
  "/api/v1/admin/auth/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: env.LOGIN_MAX_ATTEMPTS,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, _res, next) =>
      next(
        new AppError(
          429,
          "RATE_LIMITED",
          "Too many sign-in attempts. Try again in 15 minutes.",
        ),
      ),
  }),
  async (req, res) => {
    const { password } = z
      .object({ password: z.string().min(1).max(512) })
      .strict()
      .parse(req.body);
    if (!(await argon2.verify(env.ADMIN_PASSWORD_HASH, password)))
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid password.");
    await new Promise<void>((resolve, reject) =>
      req.session.regenerate((err) => (err ? reject(err) : resolve())),
    );
    req.session.admin = true;
    await new Promise<void>((resolve, reject) =>
      req.session.save((err) => (err ? reject(err) : resolve())),
    );
    res.json({ data: { authenticated: true } });
  },
);
app.get("/api/v1/admin/auth/session", (req, res) => {
  if (!req.session.admin)
    throw new AppError(401, "AUTH_REQUIRED", "Please sign in to continue.");
  res.json({ data: { authenticated: true } });
});
app.post("/api/v1/admin/auth/logout", (req, res, next) =>
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("modern_airbnd.sid", {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: env.NODE_ENV === "production",
    });
    res.status(204).end();
  }),
);
app.use("/api/v1/admin", admin);
app.use("/api/v1/admin", operations);
app.use("/api/v1/admin", portfolioAdmin);
app.use("/api/v1/admin", cmsAdmin);
app.use("/api/v1", publicEnquiries);
app.use("/api/v1", portfolioPublic);
app.use("/api/v1", cmsPublic);
app.get("/api/v1/locations", async (req, res) =>
  res.json({
    data: await databaseRead(req, res, "locations.list", () => db.location.findMany({
      where: { isActive: true, properties: { some: { status: "PUBLISHED" } } },
      select: { id: true, name: true, slug: true, state: true },
      orderBy: { name: "asc" },
    })),
  }),
);
app.get("/api/v1/settings/public", async (req, res) => {
  const { id: _id, ...s } = await databaseRead(req, res, "settings.public", settings);
  res.json({ data: { ...s, brandName: "Modern Stayz" } });
});
app.get(
  ["/api/v1/properties", "/api/v1/properties/search"],
  async (req, res) => {
    const data = await databaseRead(req, res, "properties.list", () =>
      publicProperties(req.query),
    );
    res.json({ data, meta: { count: data.length } });
  },
);
app.get("/api/v1/properties/:id/availability", async (req, res) => {
  const p = await databaseRead(req, res, "properties.availability", () =>
    db.property.findUnique({ where: { id: idSchema.parse(req.params.id) } }),
  );
  if (!p) throw new AppError(404, "RESOURCE_NOT_FOUND", "Property not found.");
  const [data] = await databaseRead(req, res, "properties.availability", () =>
    publicProperties(req.query, p.slug),
  );
  res.json({ data: data.availability });
});
app.get("/api/v1/properties/:slug", async (req, res) =>
  res.json({
    data: (
      await databaseRead(req, res, "properties.detail", () =>
        publicProperties(req.query, String(req.params.slug)),
      )
    )[0],
  }),
);
app.use((_req, _res, next) =>
  next(
    new AppError(404, "RESOURCE_NOT_FOUND", "This endpoint does not exist."),
  ),
);
app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    let status = 500,
      code = "INTERNAL_ERROR",
      message = "Something went wrong. Please retry.",
      details: unknown;
    if (err instanceof AppError) {
      ({ status, code, message, details } = err);
    } else if (err instanceof ZodError) {
      status = 400;
      code = "VALIDATION_ERROR";
      message = err.issues[0]?.message || "Check the supplied values.";
      details = err.flatten();
    } else if (classifyDatabaseError(err)) {
      const classification = classifyDatabaseError(err)!;
      ({ status, code, message } = classification);
      details = undefined;
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        status = 409;
        code = "DUPLICATE_VALUE";
        message = "This slug or record already exists.";
      } else if (["P2025", "P2003"].includes(err.code)) {
        status = 404;
        code = "RESOURCE_NOT_FOUND";
        message = "A referenced item no longer exists.";
      } else if (err.code === "P2034") {
        status = 409;
        code = "CONCURRENT_UPDATE";
        message = "Another update was made at the same time. Please retry.";
      }
    } else if (err instanceof SyntaxError) {
      status = 400;
      code = "INVALID_JSON";
      message = "Request body must be valid JSON.";
    }
    const databaseError = classifyDatabaseError(err);
    if (status >= 500)
      req.log.error(
        {
          requestId: res.locals.requestId,
          code,
          prismaCode: databaseError?.prismaCode,
          operation: res.locals.dbOperation,
          errorType: err instanceof Error ? err.name : typeof err,
        },
        "request failed",
      );
    res
      .status(status)
      .json({
        error: {
          code,
          message,
          retryable: err instanceof AppError ? err.retryable : !!databaseError?.retryable,
          ...(details ? { details } : {}),
        },
        requestId: res.locals.requestId,
      });
  },
);
