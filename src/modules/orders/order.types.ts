import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import { 
  createOrderSchema, 
  updateOrderSchema, 
  listOrdersQuerySchema 
} from './order.schema.js';

// Infers strict input typing models directly from our active edge schemas
export type CreateOrderInput = z.infer<typeof createOrderSchema.body>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema.body>;
// Swapped from .query to .querystring to match our Fastify schema structure perfectly
export type ListOrdersQueryInput = z.infer<typeof listOrdersQuerySchema.querystring>;

// Explicit external API data visibility contract for single orders
export interface OrderResponse {
  id: string;
  clientName: string;
  email: string;
  phone: string | null;
  company: string | null;
  serviceId: string;
  projectTitle: string;
  description: string;
  budget: string | null; // Mapped consistently from Decimal to string for safe JSON serialization
  deadline: Date | null;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  service?: {
    id: string;
    name: string;
    slug: string;
  };
}

// Structured envelope type tracking paginated list resources
export interface PaginatedOrderResponse {
  success: boolean;
  data: OrderResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
