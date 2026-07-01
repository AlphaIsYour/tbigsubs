import { db } from "@/lib/db";
import { sendMail } from "@/lib/mailer";

const REMINDER_THRESHOLDS = [5, 4, 3, 1, 0];

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function diffInDays(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round(
    (startOfDay(a).getTime() - startOfDay(b).getTime()) / msPerDay,
  );
}

export async function runReminderJob(): Promise<{
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
}> {
  const today = startOfDay(new Date());

  const subscriptions = await db.subscription.findMany({
    where: {
      type: "MONTHLY",
      deletedAt: null,
      dueDate: { not: null },
      status: { in: ["ACTIVE", "DUE_SOON", "OVERDUE"] },
    },
    include: {
      customer: true,
      site: { include: { customer: true } },
    },
  });

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const sub of subscriptions) {
    if (!sub.dueDate) continue;

    const daysUntilDue = diffInDays(sub.dueDate, today);
    const isOverdue = daysUntilDue < 0;
    const triggerType = isOverdue
      ? "OVERDUE"
      : REMINDER_THRESHOLDS.includes(daysUntilDue)
        ? `H-${daysUntilDue}`
        : null;

    if (!triggerType) {
      skipped++;
      continue;
    }

    const customer = sub.customer ?? sub.site.customer;
    const recipientEmail = customer.email;
    if (!recipientEmail) {
      skipped++;
      continue;
    }

    const todayKey = today.toISOString().slice(0, 10);
    const alreadySent = await db.notificationLog.findFirst({
      where: {
        subscriptionId: sub.id,
        triggerType: `${triggerType}:${todayKey}`,
        status: "SENT",
      },
    });

    if (alreadySent) {
      skipped++;
      continue;
    }

    const subject = isOverdue
      ? `Tagihan Jatuh Tempo - ${customer.name}`
      : `Pengingat Jatuh Tempo - ${customer.name}`;

    const html = `
      <p>Yth. ${customer.name},</p>
      <p>${
        isOverdue
          ? "Langganan Anda telah melewati tanggal jatuh tempo."
          : `Langganan Anda akan jatuh tempo dalam ${daysUntilDue} hari.`
      }</p>
      <p>Lokasi: ${sub.site?.name ?? "-"}</p>
      <p>Tanggal Jatuh Tempo: ${sub.dueDate.toLocaleDateString("id-ID")}</p>
      <p>Mohon segera melakukan pembayaran untuk menghindari pemutusan layanan.</p>
    `;

    const result = await sendMail({
      to: recipientEmail,
      subject,
      html,
    });

    await db.notificationLog.create({
      data: {
        subscriptionId: sub.id,
        channel: "EMAIL",
        status: result.success ? "SENT" : "FAILED",
        type: isOverdue ? "OVERDUE" : daysUntilDue === 1 ? "H1" : "DUE_SOON",
        triggerType: `${triggerType}:${todayKey}`,
        recipient: recipientEmail,
        subject,
        message: html,
        sentAt: new Date(),
        errorMessage: result.error,
      },
    });

    if (result.success) {
      sent++;
      if (isOverdue && sub.status !== "OVERDUE") {
        await db.subscription.update({
          where: { id: sub.id },
          data: { status: "OVERDUE" },
        });
      } else if (!isOverdue && daysUntilDue <= 5 && sub.status === "ACTIVE") {
        await db.subscription.update({
          where: { id: sub.id },
          data: { status: "DUE_SOON" },
        });
      }
    } else {
      failed++;
    }
  }

  return {
    processed: subscriptions.length,
    sent,
    failed,
    skipped,
  };
}
