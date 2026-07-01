import { db } from "@/lib/db";
import type {
  CreateCustomerInput,
  PaginatedResult,
  PaginationParams,
} from "@/types";
import { recordAuditLog } from "@/services/audit.service";
import { generateEntityCode } from "@/lib/code";

export async function listCustomers(
  params: PaginationParams,
): Promise<PaginatedResult<Awaited<ReturnType<typeof db.customer.findFirst>>>> {
  const { page, pageSize, search } = params;
  const skip = (page - 1) * pageSize;

  const where = {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.customer.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    db.customer.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getCustomerById(id: string) {
  return db.customer.findFirst({
    where: { id, deletedAt: null },
    include: { sites: true, subscriptions: true },
  });
}

export async function createCustomer(
  input: CreateCustomerInput,
  actorUserId?: string,
) {
  const customer = await db.customer.create({
    data: {
      code: generateEntityCode("CUST"),
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      address: input.address || null,
      picName: input.picName || null,
      isPermanent: input.isPermanent,
      notes: input.notes || null,
    },
  });

  await recordAuditLog({
    userId: actorUserId,
    action: "CREATE",
    entityType: "Customer",
    entityId: customer.id,
    newValue: customer,
  });

  return customer;
}

export async function updateCustomer(
  id: string,
  input: Partial<CreateCustomerInput>,
  actorUserId?: string,
) {
  const existing = await db.customer.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    throw new Error("customer_not_found");
  }

  const updated = await db.customer.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.email !== undefined ? { email: input.email || null } : {}),
      ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
      ...(input.address !== undefined
        ? { address: input.address || null }
        : {}),
      ...(input.picName !== undefined
        ? { picName: input.picName || null }
        : {}),
      ...(input.isPermanent !== undefined
        ? { isPermanent: input.isPermanent }
        : {}),
      ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
    },
  });

  await recordAuditLog({
    userId: actorUserId,
    action: "UPDATE",
    entityType: "Customer",
    entityId: id,
    oldValue: existing,
    newValue: updated,
  });

  return updated;
}

export async function softDeleteCustomer(id: string, actorUserId?: string) {
  const existing = await db.customer.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    throw new Error("customer_not_found");
  }

  const deleted = await db.customer.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await recordAuditLog({
    userId: actorUserId,
    action: "DELETE",
    entityType: "Customer",
    entityId: id,
    oldValue: existing,
  });

  return deleted;
}
