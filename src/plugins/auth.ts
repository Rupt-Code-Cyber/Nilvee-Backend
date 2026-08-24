import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

declare module 'fastify' {
  interface FastifyRequest {
    admin?: {
      id: string;
      email: string;
    };
  }
}

/**
 * Reusable preHandler lifecycle hook to validate incoming JSON Web Tokens securely.
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      error: { name: 'Unauthorized', message: 'Authentication required. Missing Bearer token.' },
    });
  }

  const token = authHeader.substring(7);
  const secret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

  try {
    const decoded = jwt.verify(token, secret) as { sub: string; email: string };
    
    // Attach the verified admin data securely directly to the request object space
    request.admin = {
      id: decoded.sub,
      email: decoded.email,
    };
  } catch (err: any) {
    return reply.status(401).send({
      success: false,
      error: {
        name: 'Unauthorized',
        message: err.name === 'TokenExpiredError' ? 'Authentication failed. Token has expired.' : 'Authentication failed. Invalid token.',
      },
    });
  }
}
