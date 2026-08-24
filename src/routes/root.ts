import { FastifyInstance } from 'fastify';
import { prisma } from '../config/database.js';

export async function registerV1Routes(app: FastifyInstance): Promise<void> {
  
  // GET /api/v1/health — Processes state heartbeat (Always 200 OK if server process is running)
  app.get('/health', async () => {
    return { 
      success: true, 
      status: 'UP', 
      timestamp: new Date().toISOString() 
    };
  });

  // GET /api/v1/ready — Comprehensive system readiness validation with database verification checks
  app.get('/ready', {
    schema: {
      hide: true // Exclude monitoring health checks from client public API documentation layout
    }
  }, async (_request, reply) => { // Appended underscore prefix to mark parameter as intentionally unused
    try {
      // Execute a lightweight low-overhead database diagnostic connection query
      await prisma.$queryRaw`SELECT 1`;
      
      return {
        success: true,
        status: 'READY',
        database: 'CONNECTED',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      app.log.error(`⚠️ Readiness diagnostic validation probe failed: ${error.message}`);
      
      return reply.status(503).send({
        success: false,
        status: 'NOT_READY',
        database: 'DISCONNECTED',
        error: 'Database connection parameters unresolvable or cluster unavailable'
      });
    }
  });
}
