import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().default('*'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

// Parse process.env parameters immediately
const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Invalid environment configuration variables:');
  console.error(JSON.stringify(result.error.format(), null, 2));
  process.exit(1);
}

export const env = result.data;
