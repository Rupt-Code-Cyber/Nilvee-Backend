import { z } from 'zod';
import { loginSchema } from './auth.schema.js';

export type LoginInput = z.infer<typeof loginSchema.body>;

export interface AdminPayload {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  accessToken: string;
  admin: AdminPayload;
}
