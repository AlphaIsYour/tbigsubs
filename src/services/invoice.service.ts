import { db } from "@/lib/db";
import { recordAuditLog } from "@/services/audit.service";
import type { Prisma } from "@prisma/client";

function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}${month}-${random}`;
}

export interface CreateInvoiceInput {
  subscriptionId: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  dueDate: string;
}

export async function createInvoice(
  input: CreateInvoiceInput,
  actorUserId?: string,
) {
  const invoice = await db.invoice.create({
    data: {
      subscriptionId: input.subscriptionId,
      invoiceNumber: generateInvoiceNumber(),
      periodStart: new Date(input.periodStart),
      periodEnd: new Date(input.periodEnd),
      amount: input.amount,
      dueDate: new Date(input.dueDate),
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

  return invoice;
}

export async function listInvoicesBySubscription(subscriptionId: string) {
  return db.invoice.findMany({
    where: { subscriptionId },
    include: { payments: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listInvoices(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: "open" | "PENDING" | "PARTIAL" | "PAID" | "FAILED" | "CANCELLED";
}) {
  const { page, pageSize, search, status } = params;
  const skip = (page - 1) * pageSize;
  const where: Prisma.InvoiceWhereInput = {
    ...(status === "open"
      ? { status: { in: ["PENDING", "PARTIAL"] as const } }
      : {}),
    ...(status && status !== "open" ? { status } : {}),
    ...(search
      ? {
          OR: [
            {
              invoiceNumber: { contains: search, mode: "insensitive" as const },
            },
            {
              subscription: {
                customer: {
                  name: { contains: search, mode: "insensitive" as const },
                },
              },
            },
            {
              subscription: {
                site: {
                  customer: {
                    name: { contains: search, mode: "insensitive" as const },
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.invoice.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { dueDate: "asc" },
      include: {
        subscription: {
          include: { customer: true, site: { include: { customer: true } } },
        },
        payments: true,
      },
    }),
    db.invoice.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
