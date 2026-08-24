import { z } from 'zod';

// Base regex pattern enforcing valid lower-kebab-case URL slug values
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Common schema fields reused across data objects using modern Zod v4 top-level z.uuid()
const idParamSchema = z.object({
  id: z.uuid({ error: 'Invalid service ID format. Must be a valid UUID v4' }),
});

// Define core body shape independently to cleanly extend for partial updates
const serviceBodyShape = {
  name: z
    .string({ error: 'Service name is required and must be a valid text string' })
    .trim()
    .min(3, { error: 'Service name must be at least 3 characters long' })
    .max(100, { error: 'Service name cannot exceed 100 characters' }),
  slug: z
    .string({ error: 'Service slug is required and must be a valid text string' })
    .trim()
    .min(3, { error: 'Service slug must be at least 3 characters long' })
    .max(100, { error: 'Service slug cannot exceed 100 characters' })
    .regex(slugRegex, { error: 'Invalid slug format. Must be lower-kebab-case (e.g., web-development)' }),
  description: z
    .string({ error: 'Service description is required and must be a valid text string' })
    .trim()
    .min(10, { error: 'Service description must be at least 10 characters long' }),
  isActive: z
    .boolean({ error: 'isActive must be a boolean value' })
    .optional()
    .default(true),
};

export const createServiceSchema = {
  body: z.object(serviceBodyShape).strict(),
};

export const updateServiceSchema = {
  params: idParamSchema,
  body: z.object(serviceBodyShape).partial().strict(),
};

export const getServiceByIdSchema = {
  params: idParamSchema,
};

export const deleteServiceSchema = {
  params: idParamSchema,
};
