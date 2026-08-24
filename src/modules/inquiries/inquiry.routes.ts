import { FastifyInstance } from 'fastify';
import { createInquirySchema, updateInquirySchema, getInquiryByIdSchema, deleteInquirySchema, listInquiriesQuerySchema } from './inquiry.schema.js';
import { createInquiry, getInquiryById, listInquiries, updateInquiry, deleteInquiry } from './inquiry.service.js';
import { CreateInquiryInput, UpdateInquiryInput, ListInquiriesQueryInput } from './inquiry.types.js';
import { authenticate } from '../../plugins/auth.js';

export async function registerInquiryRoutes(app: FastifyInstance): Promise<void> {

  // POST / configured with strict anti-spam 10 submissions per minute rule override
  app.post('/', { 
    schema: createInquirySchema,
    config: {
      rateLimit: { max: 10, timeWindow: '1 minute' }
    }
  }, async (request, reply) => {
    const body = request.body as CreateInquiryInput;
    const newInquiry = await createInquiry(body);
    return reply.status(201).send({ success: true, data: newInquiry });
  });

  app.get('/', { schema: listInquiriesQuerySchema, preHandler: [authenticate] }, async (request) => {
    const query = request.query as ListInquiriesQueryInput;
    const result = await listInquiries(query);
    return { success: true, data: result.data, meta: result.meta };
  });

  app.get('/:id', { schema: getInquiryByIdSchema, preHandler: [authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const inquiry = await getInquiryById(id);
    return { success: true, data: inquiry };
  });

  app.patch('/:id', { schema: updateInquirySchema, preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as UpdateInquiryInput;

    if (!body || Object.keys(body).length === 0) {
      return reply.status(400).send({
        success: false,
        error: { name: 'ValidationError', message: 'At least one valid field must be supplied for modifications' },
      });
    }

    const updated = await updateInquiry(id, body);
    return { success: true, data: updated };
  });

  // DELETE /api/v1/inquiries/:id (Protected - Permanent Purge)
  app.delete('/:id', { schema: deleteInquirySchema, preHandler: [authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const deleted = await deleteInquiry(id);
    return { success: true, data: deleted };
  });
}
