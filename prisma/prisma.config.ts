// prisma/prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Use a separate env var for direct DB access for migrations (recommended name)
  datasource: {
    url: env("DIRECT_DATABASE_URL"),
  },
});
