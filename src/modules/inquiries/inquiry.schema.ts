import { z } from 'zod';
import { InquiryStatus } from '@prisma/client';

// Shared valid UUID parameters pattern for tracking routing keys
const idParamSchema = z.object({
  id: z.uuid({ message: 'Invalid inquiry ID format. Must be a valid UUID v4' }),
});

// Production-grade Zod enumeration validator mapped directly from our Prisma Client metadata
const statusEnumSchema = z.nativeEnum(InquiryStatus, {
  message: 'Invalid inquiry status value supplied. Must be a valid state token',
});

// Shared layout fields definitions schema profile block shape
const baseInquiryBodyShape = {
  name: z
    .string({ message: 'Name is required and must be a valid text string' })
    .trim()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(100, { message: 'Name cannot exceed 100 characters' }),
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
  subject: z
    .string({ message: 'Subject is required and must be a valid text string' })
    .trim()
    .min(3, { message: 'Subject must be at least 3 characters long' })
    .max(150, { message: 'Subject cannot exceed 150 characters' }),
  message: z
    .string({ message: 'Message is required and must be a valid text string' })
    .trim()
    .min(10, { message: 'Message must be at least 10 characters long' })
    .max(5000, { message: 'Message cannot exceed 5000 characters' }),
};

// Public submission schema validation rules block (.strict() prevents unknown fields injection)
export const createInquirySchema = {
  body: z.object(baseInquiryBodyShape).strict(),
};

// Internal update operation tracking specifications parameters layout schema
export const updateInquirySchema = {
  params: idParamSchema,
  body: z
    .object({
      status: statusEnumSchema,
    })
    .strict(),
};

// Internal single-record tracking lookup rules definition layout
export const getInquiryByIdSchema = {
  params: idParamSchema,
};

// Internal resource destruction operations schema profile structure
export const deleteInquirySchema = {
  params: idParamSchema,
};

// Internal workspace listing query parameter filters verification schema mapping
export const listInquiriesQuerySchema = {
  querystring: z
    .object({
      status: statusEnumSchema.optional(),
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
