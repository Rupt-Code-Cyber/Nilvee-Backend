import { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    // Log the complete error stack internally
    request.log.error(error);

    // Cast to any safely or map properties to check for framework extensions
    const fastifyError = error as any;

    // Handle standard Fastify validation errors
    if (fastifyError.validation) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details: fastifyError.validation,
      });
    }

    const isDevelopment = env.NODE_ENV === 'development';

    // Safe error response payload
    return reply.status(fastifyError.statusCode || 500).send({
      statusCode: fastifyError.statusCode || 500,
      error: fastifyError.name || 'InternalServerError',
      message: fastifyError.message || 'An unexpected error occurred on the server',
      ...(isDevelopment && { stack: fastifyError.stack }), // Only expose stack traces in dev
    });
  });
}
