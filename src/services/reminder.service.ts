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
      plan: true,
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

    const formattedAmount = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(sub.amount));

    const formattedDueDate = sub.dueDate.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const subject = isOverdue
      ? `[PERINGATAN] Tagihan Melewati Jatuh Tempo - ${customer.name}`
      : `[PENGINGAT] Tagihan Jatuh Tempo - ${customer.name}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f5f7; color: #1a1a1a; margin: 0; padding: 20px; }
          .container { max-width: 600px; background-color: #ffffff; border: 2px solid #d6d9dd; padding: 30px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 1px solid #d6d9dd; padding-bottom: 20px; margin-bottom: 20px; }
          .header h1 { color: #11499e; font-size: 20px; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
          .greeting { font-size: 14px; line-height: 1.6; margin-bottom: 15px; }
          .alert-box { padding: 15px; border-left: 4px solid ${isOverdue ? "#b3261e" : "#b8860b"}; background-color: ${isOverdue ? "#fdf2f2" : "#fefdf0"}; color: ${isOverdue ? "#b3261e" : "#b8860b"}; font-size: 13px; font-weight: bold; margin-bottom: 20px; }
          .details-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          .details-table td { padding: 10px; border-bottom: 1px solid #f4f5f7; font-size: 13px; }
          .details-table td.label { color: #5c5f66; font-weight: bold; width: 35%; }
          .details-table td.value { font-weight: 500; }
          .payment-box { background-color: #f4f5f7; border: 1px solid #d6d9dd; padding: 15px; margin-bottom: 25px; }
          .payment-box h3 { font-size: 13px; color: #11499e; margin: 0 0 10px 0; text-transform: uppercase; }
          .payment-box p { font-size: 12px; margin: 5px 0; line-height: 1.5; color: #5c5f66; }
          .footer { font-size: 11px; color: #5c5f66; border-top: 1px solid #d6d9dd; padding-top: 15px; text-align: center; margin-top: 25px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TBIG Subs</h1>
          </div>
          <div class="greeting">
            Yth. <strong>${customer.name}</strong>,
          </div>
          <div class="alert-box">
            ${
              isOverdue
                ? "PERINGATAN: Layanan langganan Anda telah melewati batas waktu tanggal jatuh tempo pembayaran. Harap segera melunasi tagihan Anda."
                : `PEMBERITAHUAN: Tagihan langganan Anda akan jatuh tempo dalam ${daysUntilDue} hari.`
            }
          </div>
          
          <table class="details-table">
            <tr>
              <td class="label">Paket Layanan</td>
              <td class="value">${sub.plan.name}</td>
            </tr>
            <tr>
              <td class="label">Lokasi / Site</td>
              <td class="value">${sub.site?.name ?? "-"} (${sub.site?.city ?? "-"})</td>
            </tr>
            <tr>
              <td class="label">Nominal Tagihan</td>
              <td class="value" style="color: #11499e; font-weight: bold;">${formattedAmount}</td>
            </tr>
            <tr>
              <td class="label">Jatuh Tempo</td>
              <td class="value" style="color: #b3261e; font-weight: bold;">${formattedDueDate}</td>
            </tr>
          </table>

          <div class="payment-box">
            <h3>Instruksi Pembayaran</h3>
            <p>Pembayaran dapat dilakukan melalui transfer bank ke rekening berikut:</p>
            <p><strong>Bank Mandiri</strong><br>No. Rekening: <strong>123-00-9876543-21</strong><br>Atas Nama: <strong>PT Tower Bersama Infrastructure</strong></p>
            <p style="margin-top: 10px; font-style: italic;">*Harap lampirkan bukti pembayaran dengan membalas email ini atau hubungi kontak kami jika pembayaran telah dilakukan.</p>
          </div>

          <p class="greeting" style="font-size: 12px; color: #5c5f66;">
            Jika Anda sudah melakukan pembayaran, mohon abaikan email pemberitahuan ini. Terima kasih atas kerja samanya.
          </p>

          <div class="footer">
            Sistem Pengingat Otomatis - TBIG Subs<br>
            Jl. Jend. Gatot Subroto Kav. 38, Jakarta 12710<br>
            Kontak Admin: CS@towerbersama.com
          </div>
        </div>
      </body>
      </html>
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
