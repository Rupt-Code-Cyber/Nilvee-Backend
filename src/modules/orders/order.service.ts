import { prisma } from '../../config/database.js';
import { CreateOrderInput, UpdateOrderInput, ListOrdersQueryInput, OrderResponse } from './order.types.js';

// Base module error translation utility to bridge exceptions cleanly into Fastify
class OrderOperationalError extends Error {
  constructor(public statusCode: number, message: string, overrideName: string = 'BadRequest') {
    super(message);
    this.name = overrideName;
  }
}

/**
 * Persists a new development order request after validating relation constraints.
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderResponse> {
  // 1. Pre-flight check: Verify target parent service exists and is active
  const targetService = await prisma.service.findUnique({
    where: { id: input.serviceId },
  });

  if (!targetService) {
    throw new OrderOperationalError(404, `Target service with ID ${input.serviceId} does not exist`, 'NotFoundError');
  }

  if (!targetService.isActive) {
    throw new OrderOperationalError(400, `Target service '${targetService.name}' is currently inactive and cannot accept orders`);
  }

  // 2. Persist the valid order record. Status defaults automatically to PENDING at DB layer.
  const rawOrder = await prisma.order.create({
    data: {
      clientName: input.clientName,
      email: input.email,
      phone: input.phone,
      company: input.company,
      serviceId: input.serviceId,
      projectTitle: input.projectTitle,
      description: input.description,
      budget: input.budget,
      deadline: input.deadline ? new Date(input.deadline) : null,
    },
  });

  // 3. Format Decimal into string to support safe JSON network transportation
  return {
    ...rawOrder,
    budget: rawOrder.budget ? rawOrder.budget.toString() : null,
  };
}

/**
 * Retrieves a single order record populated with basic parent service descriptors.
 */
export async function getOrderById(id: string): Promise<OrderResponse> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      service: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!order) {
    throw new OrderOperationalError(404, `Order with ID ${id} not found`, 'NotFoundError');
  }

  return {
    ...order,
    budget: order.budget ? order.budget.toString() : null,
  };
}

/**
 * Searches and pagulates order rows against criteria using high-performance DB offsets.
 */
export async function listOrders(filters: ListOrdersQueryInput) {
  const { status, serviceId, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  // Build high-performance filtering criteria match mappings dynamically
  const whereClause: Record<string, unknown> = {};
  if (status) whereClause.status = status;
  if (serviceId) whereClause.serviceId = serviceId;

  // Parallelize count and slice transactions to optimize execution speeds
  const [total, records] = await prisma.$transaction([
    prisma.order.count({ where: whereClause }),
    prisma.order.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
  ]);

  const formattedData = records.map((record) => ({
    ...record,
    budget: record.budget ? record.budget.toString() : null,
  }));

  return {
    data: formattedData,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Performs field modifications across records with relational foreign key tracking protections.
 */
export async function updateOrder(id: string, input: UpdateOrderInput): Promise<OrderResponse> {
  // Confirm record existence before modification attempt
  await getOrderById(id);

  // If serviceId is being reassigned, confirm destination target is valid and active
  if (input.serviceId) {
    const targetService = await prisma.service.findUnique({
      where: { id: input.serviceId },
    });
    if (!targetService) {
      throw new OrderOperationalError(404, `Cannot update order relation. Target service with ID ${input.serviceId} does not exist`, 'NotFoundError');
    }
    if (!targetService.isActive) {
      throw new OrderOperationalError(400, `Cannot update order relation. Target service '${targetService.name}' is inactive`);
    }
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      ...input,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
    },
  });

  return {
    ...updatedOrder,
    budget: updatedOrder.budget ? updatedOrder.budget.toString() : null,
  };
}

/**
 * Purges an order row completely out of the database instance.
 */
export async function deleteOrder(id: string): Promise<OrderResponse> {
  await getOrderById(id);
  const deleted = await prisma.order.delete({ where: { id } });
  
  return {
    ...deleted,
    budget: deleted.budget ? deleted.budget.toString() : null,
  };
}
