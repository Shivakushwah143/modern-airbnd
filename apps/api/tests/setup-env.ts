import argon2 from "argon2";

process.env.NODE_ENV ||= "test";
process.env.DATABASE_URL ||=
  process.env.TEST_DATABASE_URL ||
  "postgresql://test:test@127.0.0.1:5432/modern_airbnd_test";
process.env.APP_ORIGIN ||= "http://localhost:3400";
process.env.SESSION_SECRET ||=
  "test-session-secret-modern-airbnd-local-only";
process.env.ADMIN_PASSWORD_HASH ||= await argon2.hash(
  "modern-airbnd-test-password",
  { type: argon2.argon2id },
);
