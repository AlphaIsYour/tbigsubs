import { db } from "@/lib/db";
import { recordAuditLog } from "@/services/audit.service";
import type { PaginationParams } from "@/types";
import { generateEntityCode } from "@/lib/code";

export interface CreateSiteInput {
  customerId: string;
  name: string;
  address?: string;
  city?: string;
  notes?: string;
}

export async function listSites(params: PaginationParams) {
  const { page, pageSize, search } = params;
  const skip = (page - 1) * pageSize;

  const where = {
    deletedAt: null,
    ...(search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.site.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    db.site.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getSiteById(id: string) {
  return db.site.findFirst({
    where: { id, deletedAt: null },
    include: { customer: true, subscriptions: true },
  });
}

export async function createSite(input: CreateSiteInput, actorUserId?: string) {
  const site = await db.site.create({
    data: {
      code: generateEntityCode("SITE"),
      customerId: input.customerId,
      name: input.name,
      address: input.address || null,
      city: input.city || null,
      notes: input.notes || null,
    },
  });

  await recordAuditLog({
    userId: actorUserId,
    action: "CREATE",
    entityType: "Site",
    entityId: site.id,
    newValue: site,
  });

  return site;
}

export async function updateSite(
  id: string,
  input: Partial<CreateSiteInput>,
  actorUserId?: string,
) {
  const existing = await db.site.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new Error("site_not_found");

  const updated = await db.site.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.address !== undefined
        ? { address: input.address || null }
        : {}),
      ...(input.city !== undefined ? { city: input.city || null } : {}),
      ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
      ...(input.customerId !== undefined
        ? { customerId: input.customerId }
        : {}),
    },
  });

  await recordAuditLog({
    userId: actorUserId,
    action: "UPDATE",
    entityType: "Site",
    entityId: id,
    oldValue: existing,
    newValue: updated,
  });

  return updated;
}

export async function softDeleteSite(id: string, actorUserId?: string) {
  const existing = await db.site.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new Error("site_not_found");

  const deleted = await db.site.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await recordAuditLog({
    userId: actorUserId,
    action: "DELETE",
    entityType: "Site",
    entityId: id,
    oldValue: existing,
  });

  return deleted;
}
