import { prisma } from '../../config/database.js';
import { CreateInquiryInput, UpdateInquiryInput, ListInquiriesQueryInput, InquiryResponse } from './inquiry.types.js';

// Base module error translation utility to bridge exceptions cleanly into Fastify
class InquiryOperationalError extends Error {
  constructor(public statusCode: number, message: string, overrideName: string = 'BadRequest') {
    super(message);
    this.name = overrideName;
  }
}

/**
 * Persists a new client inquiry message. Status defaults to UNREAD automatically.
 */
export async function createInquiry(input: CreateInquiryInput): Promise<InquiryResponse> {
  return prisma.inquiry.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      subject: input.subject,
      message: input.message,
    },
  });
}

/**
 * Extracts a single inquiry record by its unique UUID key.
 */
export async function getInquiryById(id: string): Promise<InquiryResponse> {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
  });

  if (!inquiry) {
    throw new InquiryOperationalError(404, `Inquiry with ID ${id} not found`, 'NotFoundError');
  }

  return inquiry;
}

/**
 * Fetches slice data and counts matching tracking rows simultaneously using db transaction blocks.
 */
export async function listInquiries(filters: ListInquiriesQueryInput) {
  const { status, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const whereClause: Record<string, unknown> = {};
  if (status) whereClause.status = status;

  // Execute count and page slice simultaneously to maximize extraction speeds
  const [total, records] = await prisma.$transaction([
    prisma.inquiry.count({ where: whereClause }),
    prisma.inquiry.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    data: records,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Mutates an inquiry's tracking status flag.
 */
export async function updateInquiry(id: string, input: UpdateInquiryInput): Promise<InquiryResponse> {
  // Guard clause to verify row existence before modification
  await getInquiryById(id);

  return prisma.inquiry.update({
    where: { id },
    data: { status: input.status },
  });
}

/**
 * Permanently removes an inquiry row from the database system.
 */
export async function deleteInquiry(id: string): Promise<InquiryResponse> {
  await getInquiryById(id);
  return prisma.inquiry.delete({
    where: { id },
  });
}
