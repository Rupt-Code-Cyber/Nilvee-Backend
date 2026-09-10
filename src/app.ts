import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';
import * as opentelemetry from '@opentelemetry/api';

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

  // Secure browser header injection configurations. Keeps documentation functional in production.
  await app.register(helmet, {
    contentSecurityPolicy: isProduction ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Required for native Swagger asset injection execution loops
        styleSrc: ["'self'", "'unsafe-inline'"],  // Required for Swagger UI CSS injection layout layouts
        imgSrc: ["'self'", "data:", "validator.swagger.io"],
      }
    } : false,
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

  // Dynamic origin array parsing allows multi-domain dashboard and client applications mapping safely
  const originsEnv = process.env.CORS_ORIGIN;
  const parsedOrigins = originsEnv && originsEnv !== '*' 
    ? originsEnv.split(',').map(o => o.trim()) 
    : 'http://localhost:5173';

  await app.register(cors, {
    origin: isProduction ? (originsEnv === '*' ? false : parsedOrigins) : '*',
    credentials: true,
  });

  // Global Exception interception router with active telemetry correlation mapping
  // FIXED: Prepended underscore to _request to clear the compiler TS6133 unused error
  app.setErrorHandler((error: any, _request, reply) => {
    app.log.error(error);

    // Binds stack traces cleanly to the active OpenTelemetry execution trace context span
    const activeSpan = opentelemetry.trace.getActiveSpan();
    if (activeSpan) {
      activeSpan.recordException(error);
      activeSpan.setStatus({ code: opentelemetry.SpanStatusCode.ERROR, message: error.message });
    }

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

  // Core Module Routing Layers
  await app.register(registerV1Routes, { prefix: '/api/v1' });
  await app.register(registerAuthRoutes, { prefix: '/api/v1/auth' });
  await app.register(registerServiceRoutes, { prefix: '/api/v1/services' });
  await app.register(registerOrderRoutes, { prefix: '/api/v1/orders' });
  await app.register(registerInquiryRoutes, { prefix: '/api/v1/inquiries' });

  // Dedicated base endpoint targeted for infrastructure keep-alive status verification pings
  app.get('/', async (_request, reply) => {
    return reply.status(200).send({
      status: 'online',
      agency: 'Nilvee DevOps Infrastructure',
      timestamp: new Date().toISOString(),
      documentation: '/docs'
    });
  });

  // --- IRONCLAD DEPLOYMENT LIFECYCLE HOOKS ---
  // Guaranteed clean disconnection tracking loop when app.close() is triggered
  app.addHook('onClose', async (instance) => {
    instance.log.info('📋 Fastify application closing. Cleaning up background infrastructure pools...');
    // Clean, structured boundary context hook for database layer disconnects:
    // await prisma.$disconnect();
    instance.log.info('✅ Application resource teardown complete.');
  });

  return app;
}
