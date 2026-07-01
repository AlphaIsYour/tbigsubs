import { db } from "@/lib/db";
import { recordAuditLog } from "@/services/audit.service";
import { generateEntityCode } from "@/lib/code";

export interface RecordPaymentInput {
  invoiceId: string;
  amount: number;
  method?: string;
  reference?: string;
  notes?: string;
}

export async function recordPayment(
  input: RecordPaymentInput,
  actorUserId?: string,
) {
  const invoice = await db.invoice.findUnique({
    where: { id: input.invoiceId },
    include: { payments: true },
  });

  if (!invoice) throw new Error("invoice_not_found");

  const payment = await db.payment.create({
    data: {
      code: generateEntityCode("PAY"),
      invoiceId: input.invoiceId,
      subscriptionId: invoice.subscriptionId,
      amount: input.amount,
      paidAt: new Date(),
      method: input.method || null,
      reference: input.reference || null,
      status: "PAID",
      recordedBy: actorUserId || null,
      notes: input.notes || null,
    },
  });

  const totalPaid =
    invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) +
    input.amount;
  const invoiceAmount = Number(invoice.amount);

  const newStatus =
    totalPaid >= invoiceAmount ? "PAID" : totalPaid > 0 ? "PARTIAL" : "PENDING";

  await db.invoice.update({
    where: { id: input.invoiceId },
    data: { status: newStatus },
  });

  if (newStatus === "PAID") {
    const subscription = await db.subscription.findUnique({
      where: { id: invoice.subscriptionId },
    });

    if (subscription && subscription.status === "OVERDUE") {
      await db.subscription.update({
        where: { id: subscription.id },
        data: { status: "ACTIVE" },
      });
    }
  }

  await recordAuditLog({
    userId: actorUserId,
    action: "CREATE",
    entityType: "Payment",
    entityId: payment.id,
    newValue: payment,
  });

  return payment;
}

export async function listPayments(params: {
  page: number;
  pageSize: number;
  search?: string;
}) {
  const { page, pageSize, search } = params;
  const skip = (page - 1) * pageSize;

  const where = search
    ? {
        invoice: {
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
          ],
        },
      }
    : {};

  const [items, total] = await Promise.all([
    db.payment.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { paidAt: "desc" },
      include: {
        invoice: {
          include: {
            subscription: { include: { customer: true } },
          },
        },
      },
    }),
    db.payment.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
