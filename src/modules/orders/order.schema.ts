import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

const idParamSchema = z.object({
  id: z.uuid({ message: 'Invalid order ID format. Must be a valid UUID v4' }),
});

const statusEnumSchema = z.nativeEnum(OrderStatus, {
  message: 'Invalid order status value supplied. Must be a valid state token',
});

const isoDateRegex = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?$/;

const baseOrderBodyShape = {
  clientName: z
    .string({ message: 'Client name is required and must be a valid text string' })
    .trim()
    .min(2, { message: 'Client name must be at least 2 characters long' })
    .max(100, { message: 'Client name cannot exceed 100 characters' }),
  email: z
    .string({ message: 'Email address is required and must be a valid text string' })
    .trim()
    .email({ message: 'Invalid email address syntax pattern' })
    .max(255, { message: 'Email address cannot exceed 255 characters' }),
  phone: z
    .string({ message: 'Phone number must be a valid text string' })
    .trim()
    .max(30, { message: 'Phone number cannot exceed 30 characters' })
    .optional()
    .nullable(),
  company: z
    .string({ message: 'Company name must be a valid text string' })
    .trim()
    .max(100, { message: 'Company name cannot exceed 100 characters' })
    .optional()
    .nullable(),
  serviceId: z
    .string({ message: 'Target service identifier is required and must be a valid text string' })
    .uuid({ message: 'Invalid serviceId layout. Must be a valid UUID v4 reference' }),
  projectTitle: z
    .string({ message: 'Project title is required and must be a valid text string' })
    .trim()
    .min(3, { message: 'Project title must be at least 3 characters long' })
    .max(150, { message: 'Project title cannot exceed 150 characters' }),
  description: z
    .string({ message: 'Project description is required and must be a valid text string' })
    .trim()
    .min(10, { message: 'Project description must be at least 10 characters long' }),
  budget: z
    .number({ message: 'Budget parameters must be numeric values' })
    .positive({ message: 'Budget pricing limits must be a positive number greater than zero' })
    .optional()
    .nullable(),
  deadline: z
    .string({ message: 'Deadline parameter must be a valid ISO date string' })
    .regex(isoDateRegex, { message: 'Invalid deadline format. Must be a valid ISO 8601 date string representation' })
    .optional()
    .nullable(),
};

export const createOrderSchema = {
  body: z.object(baseOrderBodyShape).strict(),
};

export const updateOrderSchema = {
  params: idParamSchema,
  body: z
    .object({
      ...baseOrderBodyShape,
      status: statusEnumSchema,
    })
    .partial()
    .strict(),
};

export const getOrderByIdSchema = {
  params: idParamSchema,
};

export const deleteOrderSchema = {
  params: idParamSchema,
};

export const listOrdersQuerySchema = {
  querystring: z
    .object({
      status: statusEnumSchema.optional(),
      serviceId: z.string().uuid({ message: 'Query serviceId filter must be a valid UUID format' }).optional(),
      page: z
        .string()
        .regex(/^\d+$/, { message: 'Pagination parameters must be a string containing integers' })
        .transform(Number)
        .pipe(z.number().min(1))
        .optional()
        .default(1),
      limit: z
        .string()
        .regex(/^\d+$/, { message: 'Pagination capacity limits must be a valid integer' })
        .transform(Number)
        .pipe(z.number().min(1).max(100, { message: 'Pagination limit bounds capped at a maximum of 100 entries' }))
        .optional()
        .default(20),
    })
    .strict(),
};
