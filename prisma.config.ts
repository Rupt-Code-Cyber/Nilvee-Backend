/// <reference types="node" />
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Certified Fallback Matrix: Directs migrations over port 5432 cleanly on Render
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
  migrations: {
    seed: "node --import tsx/esm prisma/seed.ts",
  },
});
