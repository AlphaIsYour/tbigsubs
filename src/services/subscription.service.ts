import { db } from "@/lib/db";
import { recordAuditLog } from "@/services/audit.service";
import type { PaginationParams } from "@/types";
import { generateEntityCode } from "@/lib/code";

export interface CreateSubscriptionInput {
  customerId: string;
  siteId: string;
  contractorId?: string;
  planId: string;
  type: "PERMANENT" | "MONTHLY";
  startDate: string;
  dueDate?: string;
  autoRenew?: boolean;
  notes?: string;
}

function computeDueDate(
  type: "PERMANENT" | "MONTHLY",
  startDate: string,
  dueDate?: string,
): Date | null {
  if (type === "PERMANENT") return null;
  if (dueDate) return new Date(dueDate);

  const start = new Date(startDate);
  const due = new Date(start);
  due.setDate(due.getDate() + 30);
  return due;
}

export async function listSubscriptions(
  params: PaginationParams & { status?: string; type?: string },
) {
  const { page, pageSize, search, status, type } = params;
  const skip = (page - 1) * pageSize;

  const where = {
    deletedAt: null,
    ...(status
      ? {
          status: status as
            | "ACTIVE"
            | "DUE_SOON"
            | "OVERDUE"
            | "SUSPENDED"
            | "CANCELLED",
        }
      : {}),
    ...(type ? { type: type as "PERMANENT" | "MONTHLY" } : {}),
    ...(search
      ? {
          customer: {
            name: { contains: search, mode: "insensitive" as const },
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.subscription.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { dueDate: "asc" },
      include: { customer: true, site: true, contractor: true, plan: true },
    }),
    db.subscription.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getSubscriptionById(id: string) {
  return db.subscription.findFirst({
    where: { id, deletedAt: null },
    include: {
      customer: true,
      site: true,
      contractor: true,
      plan: true,
      invoices: { orderBy: { createdAt: "desc" } },
      notifications: { orderBy: { sentAt: "desc" } },
    },
  });
}

export async function createSubscription(
  input: CreateSubscriptionInput,
  actorUserId?: string,
) {
  const dueDate = computeDueDate(input.type, input.startDate, input.dueDate);
  const plan = await db.subscriptionPlan.findUnique({
    where: { id: input.planId },
  });

  const subscription = await db.subscription.create({
    data: {
      code: generateEntityCode("SUB"),
      customerId: input.customerId,
      siteId: input.siteId,
      contractorId: input.contractorId || null,
      planId: input.planId,
      type: input.type,
      startDate: new Date(input.startDate),
      dueDate,
      amount: plan?.price ?? 0,
      status: "ACTIVE",
      autoRenew: input.autoRenew ?? false,
      notes: input.notes || null,
    },
  });

  await recordAuditLog({
    userId: actorUserId,
    action: "CREATE",
    entityType: "Subscription",
    entityId: subscription.id,
    newValue: subscription,
  });

  if (input.type === "MONTHLY" && dueDate) {
    const invoice = await db.invoice.create({
      data: {
        subscriptionId: subscription.id,
        invoiceNumber: generateEntityCode("INV"),
        periodStart: new Date(input.startDate),
        periodEnd: dueDate,
        dueDate,
        amount: plan?.price ?? 0,
        status: "PENDING",
      },
    });

    await recordAuditLog({
      userId: actorUserId,
      action: "CREATE",
      entityType: "Invoice",
      entityId: invoice.id,
      newValue: invoice,
    });
  }

  return subscription;
}

export async function updateSubscription(
  id: string,
  input: Partial<CreateSubscriptionInput> & { status?: string },
  actorUserId?: string,
) {
  const existing = await db.subscription.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) throw new Error("subscription_not_found");

  const updated = await db.subscription.update({
    where: { id },
    data: {
      ...(input.siteId !== undefined ? { siteId: input.siteId } : {}),
      ...(input.contractorId !== undefined
        ? { contractorId: input.contractorId || null }
        : {}),
      ...(input.planId !== undefined ? { planId: input.planId } : {}),
      ...(input.dueDate !== undefined
        ? { dueDate: input.dueDate ? new Date(input.dueDate) : null }
        : {}),
      ...(input.autoRenew !== undefined ? { autoRenew: input.autoRenew } : {}),
      ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
      ...(input.status !== undefined
        ? {
            status: input.status as
              | "ACTIVE"
              | "DUE_SOON"
              | "OVERDUE"
              | "SUSPENDED"
              | "CANCELLED",
          }
        : {}),
    },
  });

  await recordAuditLog({
    userId: actorUserId,
    action: "UPDATE",
    entityType: "Subscription",
    entityId: id,
    oldValue: existing,
    newValue: updated,
  });

  return updated;
}

export async function renewMonthlySubscription(
  id: string,
  actorUserId?: string,
) {
  const existing = await db.subscription.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) throw new Error("subscription_not_found");
  if (existing.type !== "MONTHLY") throw new Error("not_monthly_subscription");

  const baseDate =
    existing.dueDate && existing.dueDate > new Date()
      ? existing.dueDate
      : new Date();
  const newDueDate = new Date(baseDate);
  newDueDate.setDate(newDueDate.getDate() + 30);

  const updated = await db.subscription.update({
    where: { id },
    data: {
      dueDate: newDueDate,
      status: "ACTIVE",
    },
  });

  await recordAuditLog({
    userId: actorUserId,
    action: "RENEW",
    entityType: "Subscription",
    entityId: id,
    oldValue: existing,
    newValue: updated,
  });

  return updated;
}

export async function softDeleteSubscription(id: string, actorUserId?: string) {
  const existing = await db.subscription.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) throw new Error("subscription_not_found");

  const deleted = await db.subscription.update({
    where: { id },
    data: { deletedAt: new Date(), status: "CANCELLED" },
  });

  await recordAuditLog({
    userId: actorUserId,
    action: "DELETE",
    entityType: "Subscription",
    entityId: id,
    oldValue: existing,
  });

  return deleted;
}
