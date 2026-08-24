import { z } from 'zod';

// Ensure the clean export name loginSchema matches our type provider calls exactly
export const loginSchema = {
  body: z
    .object({
      email: z
        .string({ message: 'Administrative email address is required and must be a valid text string' })
        .trim()
        .email({ message: 'Invalid administrative email address syntax pattern' })
        .max(255, { message: 'Administrative email address cannot exceed 255 characters' }),
      password: z
        .string({ message: 'Administrative security passphrase string is required' })
        .min(8, { message: 'Administrative passphrase must be at least 8 characters long' })
        .max(100, { message: 'Administrative passphrase cannot exceed 100 characters' }),
    })
    .strict(),
};
