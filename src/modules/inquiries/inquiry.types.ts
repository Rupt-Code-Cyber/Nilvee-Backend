import { z } from 'zod';
import { InquiryStatus } from '@prisma/client';
import { createInquirySchema, updateInquirySchema, listInquiriesQuerySchema } from './inquiry.schema.js';

// Infers strict typing parameters directly out of our Zod schemas
export type CreateInquiryInput = z.infer<typeof createInquirySchema.body>;
export type UpdateInquiryInput = z.infer<typeof updateInquirySchema.body>;
export type ListInquiriesQueryInput = z.infer<typeof listInquiriesQuerySchema.querystring>;

// Explicit data visibility contract matching client outputs
export interface InquiryResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string;
  message: string;
  status: InquiryStatus;
  createdAt: Date;
  updatedAt: Date;
}
