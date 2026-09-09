import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../../config/database.js';
import { LoginInput, LoginResponse, AdminPayload } from './auth.types.js';

class AuthOperationalError extends Error {
  constructor(public statusCode: number, message: string, overrideName: string = 'Unauthorized') {
    super(message);
    this.name = overrideName;
  }
}

/**
 * Verifies credentials and issues a signed stateless JWT token.
 */
export async function authenticateAdmin(input: LoginInput): Promise<LoginResponse> {
  const genericError = new AuthOperationalError(401, 'Invalid email or password credentials supplied');

  const admin = await prisma.admin.findUnique({
    where: { email: input.email.toLowerCase().trim() },
  });

  if (!admin) {
    throw genericError;
  }

  // Pure JavaScript execution match layer avoiding binary hooks
  const isMatch = await bcrypt.compare(input.password, admin.passwordHash);
  if (!isMatch) {
    throw genericError;
  }

  const secret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
  
  const tokenOptions: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as any,
  };

  const token = jwt.sign(
    { sub: admin.id, email: admin.email },
    secret,
    tokenOptions
  );

  return {
    accessToken: token,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    },
  };
}

/**
 * Extracts administrative account profiles by their primary identifier, hiding password hashes.
 */
export async function getAdminProfileById(id: string): Promise<AdminPayload> {
  const admin = await prisma.admin.findUnique({
    where: { id },
  });

  if (!admin) {
    throw new AuthOperationalError(404, 'Administrative profile record not found', 'NotFoundError');
  }

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
  };
}

/**
 * Idempotent environment bootstrap utility to safely establish the initial workspace admin user.
 */
export async function bootstrapInitialAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim();

  if (!email || !password || !name) {
    return;
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    return;
  }

  // Safe pure JS hashing pass using standard 12 workload rounds
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  await prisma.admin.create({
    data: { email, passwordHash, name },
  });
}
