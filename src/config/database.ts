import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Hardcoded directly to your live cloud Supabase Transaction Pooler on port 6543
const pool = new pg.Pool({ 
  connectionString: "postgresql://postgres.ucoktkheabwfkrgdwtfk:N1lvee_Cyber_Agency_Prod_2026_Secure_Key@://supabase.com" 
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter, 
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ Database connectivity validation failure:', error);
    return false;
  }
}
