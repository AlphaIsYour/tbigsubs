import { db } from "@/lib/db";
import { recordAuditLog } from "@/services/audit.service";
import type { PaginationParams } from "@/types";
import { generateEntityCode } from "@/lib/code";

export interface CreateContractorInput {
  name: string;
  email?: string;
  phone?: string;
  picName?: string;
  notes?: string;
}

export async function listContractors(params: PaginationParams) {
  const { page, pageSize, search } = params;
  const skip = (page - 1) * pageSize;

  const where = {
    deletedAt: null,
    ...(search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.contractor.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    db.contractor.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getContractorById(id: string) {
  return db.contractor.findFirst({
    where: { id, deletedAt: null },
    include: { subscriptions: true },
  });
}

export async function createContractor(
  input: CreateContractorInput,
  actorUserId?: string,
) {
  const contractor = await db.contractor.create({
    data: {
      code: generateEntityCode("CONT"),
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      picName: input.picName || null,
      notes: input.notes || null,
    },
  });

  await recordAuditLog({
    userId: actorUserId,
    action: "CREATE",
    entityType: "Contractor",
    entityId: contractor.id,
    newValue: contractor,
  });

  return contractor;
}

export async function updateContractor(
  id: string,
  input: Partial<CreateContractorInput>,
  actorUserId?: string,
) {
  const existing = await db.contractor.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) throw new Error("contractor_not_found");

  const updated = await db.contractor.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.email !== undefined ? { email: input.email || null } : {}),
      ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
      ...(input.picName !== undefined
        ? { picName: input.picName || null }
        : {}),
      ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
    },
  });

  await recordAuditLog({
    userId: actorUserId,
    action: "UPDATE",
    entityType: "Contractor",
    entityId: id,
    oldValue: existing,
    newValue: updated,
  });

  return updated;
}

export async function softDeleteContractor(id: string, actorUserId?: string) {
  const existing = await db.contractor.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) throw new Error("contractor_not_found");

  const deleted = await db.contractor.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await recordAuditLog({
    userId: actorUserId,
    action: "DELETE",
    entityType: "Contractor",
    entityId: id,
    oldValue: existing,
  });

  return deleted;
}
