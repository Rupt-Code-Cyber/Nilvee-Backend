import { FastifyInstance } from 'fastify';
import { createOrderSchema, updateOrderSchema, getOrderByIdSchema, deleteOrderSchema, listOrdersQuerySchema } from './order.schema.js';
import { createOrder, getOrderById, listOrders, updateOrder, deleteOrder } from './order.service.js';
import { CreateOrderInput, UpdateOrderInput, ListOrdersQueryInput } from './order.types.js';
import { authenticate } from '../../plugins/auth.js';

export async function registerOrderRoutes(app: FastifyInstance): Promise<void> {
  
  // POST / configured with strict anti-spam 10 submissions per minute rule override
  app.post('/', { 
    schema: createOrderSchema,
    config: {
      rateLimit: { max: 10, timeWindow: '1 minute' }
    }
  }, async (request, reply) => {
    const body = request.body as CreateOrderInput;
    const newOrder = await createOrder(body);
    return reply.status(201).send({ success: true, data: newOrder });
  });

  app.get('/', { schema: listOrdersQuerySchema, preHandler: [authenticate] }, async (request) => {
    const query = request.query as ListOrdersQueryInput;
    const result = await listOrders(query);
    return { success: true, data: result.data, meta: result.meta };
  });

  app.get('/:id', { schema: getOrderByIdSchema, preHandler: [authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const order = await getOrderById(id);
    return { success: true, data: order };
  });

  app.patch('/:id', { schema: updateOrderSchema, preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as UpdateOrderInput;

    if (!body || Object.keys(body).length === 0) {
      return reply.status(400).send({
        success: false,
        error: { name: 'ValidationError', message: 'At least one valid field must be supplied for modifications' },
      });
    }

    const updated = await updateOrder(id, body);
    return { success: true, data: updated };
  });

  app.delete('/:id', { schema: deleteOrderSchema, preHandler: [authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const deleted = await deleteOrder(id);
    return { success: true, data: deleted };
  });
}
