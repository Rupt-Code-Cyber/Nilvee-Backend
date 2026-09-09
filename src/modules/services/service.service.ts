import { prisma } from '../../config/database.js';
import { CreateServiceInput, UpdateServiceInput, ServiceResponse } from './service.types.js';

/**
 * Custom operational error utility to bridge database anomalies cleanly 
 * into our existing global Fastify error handling infrastructure layer.
 */
class ServiceOperationalError extends Error {
  constructor(public statusCode: number, message: string, overrideName: string = 'BadRequest') {
    super(message);
    this.name = overrideName;
  }
}

/**
 * Retrieve all services from the database.
 * @param includeInactive If true, returns all services; if false, returns only active records.
 */
export async function getAllServices(includeInactive = false): Promise<ServiceResponse[]> {
  return prisma.service.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Retrieve a single service record by its unique UUID primary key.
 */
export async function getServiceById(id: string): Promise<ServiceResponse> {
  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    throw new ServiceOperationalError(404, `Service with ID ${id} not found`, 'NotFoundError');
  }

  return service;
}

/**
 * Create a new service record after validating slug uniqueness.
 */
export async function createService(input: CreateServiceInput): Promise<ServiceResponse> {
  const existingSlug = await prisma.service.findUnique({
    where: { slug: input.slug },
  });

  if (existingSlug) {
    throw new ServiceOperationalError(
      409,
      `A service with the slug '${input.slug}' already exists`,
      'ConflictError'
    );
  }

  return prisma.service.create({
    data: input,
  });
}

/**
 * Update an existing service record by ID after validating partial fields and slug parameters.
 */
export async function updateService(id: string, input: UpdateServiceInput): Promise<ServiceResponse> {
  // Ensure the target service actually exists first
  await getServiceById(id);

  // If a slug update is requested, verify it won't conflict with another service
  if (input.slug) {
    const conflictingService = await prisma.service.findFirst({
      where: {
        slug: input.slug,
        id: { not: id }, // Exclude current service from lookup check
      },
    });

    if (conflictingService) {
      throw new ServiceOperationalError(
        409,
        `Cannot update slug. A service with the slug '${input.slug}' already exists`,
        'ConflictError'
      );
    }
  }

  return prisma.service.update({
    where: { id },
    data: input,
  });
}

/**
 * Permanently remove a service record by its unique UUID key.
 */
export async function deleteService(id: string): Promise<ServiceResponse> {
  // Verify the asset exists before execution
  await getServiceById(id);

  return prisma.service.delete({
    where: { id },
  });
}

/**
 * Operational check for health monitoring.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    console.error('❌ Database connectivity validation failure:', message);
    return false;
  }
}
