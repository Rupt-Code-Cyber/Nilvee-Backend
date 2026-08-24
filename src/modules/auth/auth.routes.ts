import { FastifyInstance } from 'fastify';
import { loginSchema } from './auth.schema.js';
import { authenticateAdmin, getAdminProfileById, bootstrapInitialAdmin } from './auth.service.js';
import { LoginInput } from './auth.types.js';
import { authenticate } from '../../plugins/auth.js';

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  
  // Guard bootstrap routines to allow external drivers to settle during testing
  app.addHook('onReady', async () => {
    app.log.info('🛡️ Checking for administrative identity initialization configurations...');
    try {
      await bootstrapInitialAdmin();
    } catch (error: any) {
      app.log.warn(`⚠️ Administrative initialization deferred: ${error.message}`);
    }
  });

  app.post('/login', { 
    schema: loginSchema,
    config: {
      rateLimit: { max: 5, timeWindow: '1 minute' }
    }
  }, async (request, reply) => {
    const body = request.body as LoginInput;
    const result = await authenticateAdmin(body);
    return reply.status(200).send({ success: true, data: result });
  });

  app.get('/me', { preHandler: [authenticate] }, async (request) => {
    const adminId = request.admin!.id;
    const profile = await getAdminProfileById(adminId);
    return { success: true, data: profile };
  });
}
