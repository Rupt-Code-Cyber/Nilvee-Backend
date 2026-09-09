import { z } from 'zod';
import { createServiceSchema, updateServiceSchema } from './service.schema.js';

// Infer the exact request payload body shape required to create a service
export type CreateServiceInput = z.infer<typeof createServiceSchema.body>;

// Infer the exact parameter shape required for identifying service resources by UUID
export type ServiceParamsInput = z.infer<typeof updateServiceSchema.params>;

// Infer the exact partial update body payload shape required for updates
export type UpdateServiceInput = z.infer<typeof updateServiceSchema.body>;

// Define a structural interface for a standard service response object model
export interface ServiceResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
