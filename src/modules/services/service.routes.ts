import { FastifyInstance } from 'fastify';
import { 
  createServiceSchema, 
  updateServiceSchema, 
  getServiceByIdSchema, 
  deleteServiceSchema 
} from './service.schema.js';
import { 
  getAllServices, 
  getServiceById, 
  createService, 
  updateService, 
  deleteService 
} from './service.service.js';
import { CreateServiceInput, UpdateServiceInput } from './service.types.js';

export async function registerServiceRoutes(app: FastifyInstance): Promise<void> {
  
  // GET /api/v1/services
  app.get('/', async () => {
    const services = await getAllServices(false);
    return { success: true, data: services };
  });

  // GET /api/v1/services/internal
  app.get('/internal', async () => {
    const services = await getAllServices(true);
    return { success: true, data: services };
  });

  // GET /api/v1/services/:id
  app.get('/:id', { schema: getServiceByIdSchema }, async (request) => {
    const { id } = request.params as { id: string };
    const service = await getServiceById(id);
    return { success: true, data: service };
  });

  // POST /api/v1/services
  app.post('/', { schema: createServiceSchema }, async (request, reply) => {
    const body = request.body as CreateServiceInput;
    const newService = await createService(body);
    return reply.status(201).send({ success: true, data: newService });
  });

  // PATCH /api/v1/services/:id
  app.patch('/:id', { schema: updateServiceSchema }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as UpdateServiceInput;

    // Bulletproof defensive validation check at the controller edge
    if (!body || Object.keys(body).length === 0) {
      return reply.status(400).send({
        success: false,
        error: {
          name: 'ValidationError',
          message: 'At least one valid field (name, slug, description, or isActive) must be supplied for updates'
        }
      });
    }

    const updated = await updateService(id, body);
    return { success: true, data: updated };
  });

  // DELETE /api/v1/services/:id
  app.delete('/:id', { schema: deleteServiceSchema }, async (request) => {
    const { id } = request.params as { id: string };
    const deleted = await deleteService(id);
    return { success: true, data: deleted };
  });
}
