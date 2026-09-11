/// <reference types="node" />
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Dynamic Fallback Matrix: Seamlessly intercepts your direct 5432 migration line
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
  migrations: {
    seed: "node --import tsx/esm prisma/seed.ts",
  },
});
