import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';
import { registerV1Routes } from './routes/root.js';
import { registerServiceRoutes } from './modules/services/service.routes.js';
import { registerOrderRoutes } from './modules/orders/order.routes.js';
import { registerInquiryRoutes } from './modules/inquiries/inquiry.routes.js';
import { registerAuthRoutes } from './modules/auth/auth.routes.js';

export async function createApplication() {
  const isProduction = process.env.NODE_ENV === 'production';

  const app = fastify({
    bodyLimit: 131072, // Strict request body limits (128 KB)
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        !isProduction
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Toggle strict browser protections (CSP only off during dev loop for Swagger UI scripts)
  await app.register(helmet, {
    contentSecurityPolicy: isProduction,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (_request, context) => ({
      success: false,
      error: {
        name: 'TooManyRequests',
        message: `Rate limit bounds exceeded. Please wait ${context.after} before attempting another interaction.`,
      },
    }),
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Nilvee Backend API Documentation',
        description: 'Production-ready core API endpoint structures for Nilvee Engineering Agency',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Provide your signed admin JWT access token to authorize access to internal views'
          }
        }
      }
    },
    transform: jsonSchemaTransform,
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // Strict CORS parsing: reads from environment variables, falls back to a clean default for local loops
  const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  await app.register(cors, {
    origin: isProduction ? (allowedOrigin === '*' ? false : allowedOrigin) : '*',
    credentials: true,
  });

  app.setErrorHandler((error: any, _request, reply) => {
    app.log.error(error);

    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        success: false,
        error: { name: error.name, message: error.message },
      });
    }

    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: {
          name: 'ValidationError',
          message: 'Invalid request payload parameters supplied',
          details: error.validation,
        },
      });
    }

    return reply.status(500).send({
      success: false,
      error: {
        name: 'InternalServerError',
        message: isProduction ? 'An unexpected system error occurred' : error.message,
      },
    });
  });

  await app.register(registerV1Routes, { prefix: '/api/v1' });
  await app.register(registerAuthRoutes, { prefix: '/api/v1/auth' });
  await app.register(registerServiceRoutes, { prefix: '/api/v1/services' });
  await app.register(registerOrderRoutes, { prefix: '/api/v1/orders' });
  await app.register(registerInquiryRoutes, { prefix: '/api/v1/inquiries' });

  return app;
}
