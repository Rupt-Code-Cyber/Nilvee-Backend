import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Initialize a native Node-postgres TCP connection pool using the transaction pooler URL
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Map the physical pool socket interface directly over into the Prisma adapter layer
const adapter = new PrismaPg(pool);

// Initialize Prisma using the explicit PostgreSQL database driver adapter structure for Prisma v7
export const prisma = new PrismaClient({
  // In Prisma v7, pass the driver adapter instance directly onto the root constructor option parameters
  adapter, 
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Run a minimal live test transaction query over the active adapter bridge interface
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ Database connectivity validation failure:', error);
    return false;
  }
}
