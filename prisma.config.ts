/// <reference types="node" />
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "node --import tsx/esm prisma/seed.ts",
  },
  datasource: {
    // Hardcoded directly to your cloud Supabase database on port 5432 to completely bypass Render text box formatting bugs
    url: "postgresql://postgres.ucoktkheabwfkrgdwtfk:N1lvee_Cyber_Agency_Prod_2026_Secure_Key@://supabase.com",
  },
});
