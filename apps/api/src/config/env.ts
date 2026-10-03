import { z } from "zod";
const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().startsWith("postgresql://"),
  APP_ORIGIN: z.string().url().default("http://localhost:3000"),
  SESSION_SECRET: z.string().min(32),
  ADMIN_PASSWORD_HASH: z.string().startsWith("$argon2id$"),
  SESSION_MAX_AGE_MS: z.coerce
    .number()
    .int()
    .positive()
    .max(43200000)
    .default(28800000),
  LOGIN_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  TRUST_PROXY: z.coerce.number().int().min(0).max(1).default(0),
  CLOUDINARY_CLOUD_NAME: z.string().default(""),
  CLOUDINARY_API_KEY: z.string().default(""),
  CLOUDINARY_API_SECRET: z.string().default(""),
  LOG_LEVEL: z.string().default("info"),
});
export const env = schema.parse(process.env);
if (env.NODE_ENV === "production" && !env.APP_ORIGIN.startsWith("https://"))
  throw new Error("APP_ORIGIN must use HTTPS in production");
