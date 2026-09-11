/// <reference types="node" />
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "node --import tsx/esm prisma/seed.ts",
  },
  datasource: {
    // FIXED: Falling back to an empty string avoids P1013 host errors during type-check builds
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
