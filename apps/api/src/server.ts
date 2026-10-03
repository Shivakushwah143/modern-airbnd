import { app, logger } from "./app.js";
import { env } from "./config/env.js";
import { db, sessionPool } from "./db.js";
const server = app.listen(env.PORT, "0.0.0.0", () =>
  logger.info({ port: env.PORT }, "Modern Airbnd API ready"),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => {
    logger.info({ signal }, "shutting down");
    server.close(async () => {
      await db.$disconnect();
      await sessionPool.end();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  });
