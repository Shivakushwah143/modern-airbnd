import { PrismaClient } from "@prisma/client";
import pg from "pg";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

type DatabaseGlobals = typeof globalThis & {
  modernStayzPrisma?: PrismaClient;
  modernStayzSessionPool?: pg.Pool;
};
const databaseGlobals = globalThis as DatabaseGlobals;

let client = databaseGlobals.modernStayzPrisma;
if (!client) {
  const createdPrisma = new PrismaClient({
    log: [{ emit: "event", level: "query" }],
  });
  createdPrisma.$on("query", (event) => {
    if (event.duration >= env.DB_SLOW_QUERY_MS)
      logger.warn(
        {
          component: "database",
          durationMs: event.duration,
          target: event.target,
        },
        "slow database query",
      );
  });
  databaseGlobals.modernStayzPrisma = createdPrisma;
  client = createdPrisma;
}
export const db = client;

export const sessionPool =
  databaseGlobals.modernStayzSessionPool ??
  new pg.Pool({ connectionString: env.DATABASE_URL, max: env.SESSION_POOL_MAX });
databaseGlobals.modernStayzSessionPool = sessionPool;
