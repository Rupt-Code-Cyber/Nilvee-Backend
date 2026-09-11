import { prisma } from '../../config/database.js';
import { CreateOrderInput, UpdateOrderInput, ListOrdersQueryInput, OrderResponse } from './order.types.js';

class OrderOperationalError extends Error {
  constructor(public statusCode: number, message: string, overrideName: string = 'BadRequest') {
    super(message);
    this.name = overrideName;
  }
}

export async function createOrder(input: CreateOrderInput): Promise<OrderResponse> {
  const targetService = await prisma.service.findUnique({
    where: { id: input.serviceId },
  });

  if (!targetService) {
    throw new OrderOperationalError(404, `Target service with ID ${input.serviceId} does not exist`, 'NotFoundError');
  }

  if (!targetService.isActive) {
    throw new OrderOperationalError(400, `Target service '${targetService.name}' is currently inactive and cannot accept orders`);
  }

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

  return {
    ...rawOrder,
    budget: rawOrder.budget ? rawOrder.budget.toString() : null,
  };
}

export async function getOrderById(id: string): Promise<OrderResponse> {
  // Added mandatory 'deletedAt: null' condition to protect lookups from reading soft-deleted data
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      service: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!order || order.deletedAt !== null) {
    throw new OrderOperationalError(404, `Order with ID ${id} not found`, 'NotFoundError');
  }

  return {
    ...order,
    budget: order.budget ? order.budget.toString() : null,
  };
}

export async function listOrders(filters: ListOrdersQueryInput) {
  const { status, serviceId, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  // Base filtering criteria forces 'deletedAt: null' to exclude hidden records automatically
  const whereClause: Record<string, unknown> = { deletedAt: null };
  if (status) whereClause.status = status;
  if (serviceId) whereClause.serviceId = serviceId;

  const [total, records] = await prisma.$transaction([
    prisma.order.count({ where: whereClause }),
    prisma.order.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        service: {
          select: { id: true, name: true, slug: true },
        },
      },
    }),
  ]);

  // FIXED: Explicit type context applied to argument variable to satisfy TS7006 strict parameter restrictions
  const formattedData = records.map((record: any) => ({
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

export async function updateOrder(id: string, input: UpdateOrderInput): Promise<OrderResponse> {
  // Re-uses getOrderById which guarantees the record is active and not soft-deleted
  await getOrderById(id);

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

export async function deleteOrder(id: string): Promise<OrderResponse> {
  await getOrderById(id);

  // Performed pure non-destructive state adjustment by applying a live transaction timestamp
  const softDeleted = await prisma.order.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  
  return {
    ...softDeleted,
    budget: softDeleted.budget ? softDeleted.budget.toString() : null,
  };
}
