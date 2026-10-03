import { PrismaClient } from "@prisma/client";
import pg from "pg";
import { env } from "./config/env.js";
export const db = new PrismaClient();
export const sessionPool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 4,
});
