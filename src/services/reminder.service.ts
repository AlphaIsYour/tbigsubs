import { db } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { recordAuditLog } from "@/services/audit.service";

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
      contractor: true,
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
    const adminEmail = customer.email ? customer.email.replace(/;/g, ",") : "";
    const contractorEmail = sub.contractor?.email ? sub.contractor.email.trim() : null;

    let toEmail = "";
    let ccEmail: string | undefined = undefined;

    // Send to Mitra (Contractor) as TO, and Admin as CC
    if (contractorEmail) {
      toEmail = contractorEmail;
      ccEmail = adminEmail || undefined;
    } else if (adminEmail) {
      toEmail = adminEmail;
    } else {
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

    const formattedDueDate = sub.dueDate.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const subject = isOverdue
      ? `[PERINGATAN SPARK] Jatuh Tempo Penyambungan PLN Sementara - ${sub.site.name}`
      : `[PENGINGAT SPARK] Jatuh Tempo Penyambungan PLN Sementara - ${sub.site.name}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f5f7; color: #1a1a1a; margin: 0; padding: 20px; }
          .container { max-width: 600px; background-color: #ffffff; border: 2px solid #d6d9dd; padding: 30px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 1px solid #d6d9dd; padding-bottom: 20px; margin-bottom: 20px; }
          .header h1 { color: #11499e; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
          .header p { font-size: 11px; color: #5c5f66; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px; }
          .greeting { font-size: 14px; line-height: 1.6; margin-bottom: 15px; }
          .alert-box { padding: 20px; border-left: 4px solid ${isOverdue ? "#b3261e" : "#b8860b"}; background-color: ${isOverdue ? "#fdf2f2" : "#fefdf0"}; color: ${isOverdue ? "#b3261e" : "#b8860b"}; font-size: 13px; font-weight: bold; line-height: 1.6; margin-bottom: 20px; }
          .details-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          .details-table td { padding: 10px; border-bottom: 1px solid #f4f5f7; font-size: 13px; }
          .details-table td.label { color: #5c5f66; font-weight: bold; width: 35%; }
          .details-table td.value { font-weight: 500; }
          .footer { font-size: 11px; color: #5c5f66; border-top: 1px solid #d6d9dd; padding-top: 15px; text-align: center; margin-top: 25px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SPARK</h1>
            <p>Monitoring Temporary Power</p>
          </div>
          <div class="greeting">
            Yth. Bapak/Ibu Mitra CME / Pengelola Site,
          </div>
          
          <div class="alert-box">
            MOHON SEGERA DILAKUKAN PENGURUSAN REGISTER PERPANJANGAN PERIODE PENYAMBUNGAN PLN SEMENTARA/MULTIGUNA DAN SEGERA DILAKUKAN PEMBAYARAN REGISTER.
            <br/><br/>
            ${
              isOverdue
                ? "Status: Masa berlaku penyambungan PLN Sementara/Multiguna TELAH MELEWATI BATAS WAKTU."
                : `Status: Masa berlaku penyambungan PLN Sementara/Multiguna akan berakhir dalam ${daysUntilDue} hari.`
            }
          </div>
          
          <table class="details-table">
            <tr>
              <td class="label">Nama Site</td>
              <td class="value">${sub.site?.name ?? "-"}</td>
            </tr>
            <tr>
              <td class="label">Site ID</td>
              <td class="value">${sub.site?.code ?? "-"}</td>
            </tr>
            <tr>
              <td class="label">Paket Layanan</td>
              <td class="value">${sub.plan.name}</td>
            </tr>
            <tr>
              <td class="label">Jatuh Tempo</td>
              <td class="value" style="color: #b3261e; font-weight: bold;">${formattedDueDate}</td>
            </tr>
            <tr>
              <td class="label">MG Type</td>
              <td class="value">${sub.mgSuplisiNormal ?? "-"}</td>
            </tr>
          </table>

          <p class="greeting" style="font-size: 12px; color: #5c5f66;">
            Harap segera melakukan koordinasi dengan pihak PLN terkait dan menyelesaikan pembayaran register perpanjangan. Abaikan pemberitahuan ini apabila proses perpanjangan sudah dilakukan. Terima kasih atas perhatian dan kerja samanya.
          </p>

          <div class="footer">
            Sistem Monitoring Temporary Power - SPARK<br>
            Jl. Jend. Gatot Subroto Kav. 38, Jakarta 12710
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendMail({
      to: toEmail,
      cc: ccEmail,
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
        recipient: toEmail,
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

export async function sendManualReminder(
  subscriptionId: string,
  actorUserId?: string,
): Promise<{ success: boolean; error?: string }> {
  const sub = await db.subscription.findFirst({
    where: { id: subscriptionId, deletedAt: null },
    include: {
      customer: true,
      site: { include: { customer: true } },
      plan: true,
      contractor: true,
    },
  });

  if (!sub) {
    return { success: false, error: "Data langganan tidak ditemukan" };
  }

  const customer = sub.customer ?? sub.site.customer;
  const adminEmail = customer.email ? customer.email.replace(/;/g, ",") : "";
  const contractorEmail = sub.contractor?.email ? sub.contractor.email.trim() : null;

  let toEmail = "";
  let ccEmail: string | undefined = undefined;

  // Send to Mitra (Contractor) as TO, and Admin as CC
  if (contractorEmail) {
    toEmail = contractorEmail;
    ccEmail = adminEmail || undefined;
  } else if (adminEmail) {
    toEmail = adminEmail;
  } else {
    return { success: false, error: "Tidak ada email penerima (Mitra/Admin) yang dikonfigurasi" };
  }

  const formattedDueDate = sub.dueDate
    ? sub.dueDate.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  const subject = `[PENGINGAT MANUAL SPARK] Jatuh Tempo Penyambungan PLN Sementara - ${sub.site.name}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f5f7; color: #1a1a1a; margin: 0; padding: 20px; }
        .container { max-width: 600px; background-color: #ffffff; border: 2px solid #d6d9dd; padding: 30px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 1px solid #d6d9dd; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { color: #11499e; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
        .header p { font-size: 11px; color: #5c5f66; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px; }
        .greeting { font-size: 14px; line-height: 1.6; margin-bottom: 15px; }
        .alert-box { padding: 20px; border-left: 4px solid #11499e; background-color: #f0f4fa; color: #11499e; font-size: 13px; font-weight: bold; line-height: 1.6; margin-bottom: 20px; }
        .details-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .details-table td { padding: 10px; border-bottom: 1px solid #f4f5f7; font-size: 13px; }
        .details-table td.label { color: #5c5f66; font-weight: bold; width: 35%; }
        .details-table td.value { font-weight: 500; }
        .footer { font-size: 11px; color: #5c5f66; border-top: 1px solid #d6d9dd; padding-top: 15px; text-align: center; margin-top: 25px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SPARK</h1>
          <p>Monitoring Temporary Power</p>
        </div>
        <div class="greeting">
          Yth. Bapak/Ibu Mitra CME / Pengelola Site,
        </div>
        <div class="alert-box">
          MOHON SEGERA DILAKUKAN PENGURUSAN REGISTER PERPANJANGAN PERIODE PENYAMBUNGAN PLN SEMENTARA/MULTIGUNA DAN SEGERA DILAKUKAN PEMBAYARAN REGISTER.
          <br/><br/>
          Status: PENGINGAT MANUAL - Masa berlaku penyambungan PLN Sementara/Multiguna memerlukan perhatian pengurusan perpanjangan segera.
        </div>
        
        <table class="details-table">
          <tr>
            <td class="label">Nama Site</td>
            <td class="value">${sub.site?.name ?? "-"}</td>
          </tr>
          <tr>
            <td class="label">Site ID</td>
            <td class="value">${sub.site?.code ?? "-"}</td>
          </tr>
          <tr>
            <td class="label">Paket Layanan</td>
            <td class="value">${sub.plan.name}</td>
          </tr>
          <tr>
            <td class="label">Jatuh Tempo</td>
            <td class="value" style="color: #b3261e; font-weight: bold;">${formattedDueDate}</td>
          </tr>
          <tr>
            <td class="label">MG Type</td>
            <td class="value">${sub.mgSuplisiNormal ?? "-"}</td>
          </tr>
        </table>

        <p class="greeting" style="font-size: 12px; color: #5c5f66;">
          Harap segera melakukan koordinasi dengan pihak PLN terkait dan menyelesaikan pembayaran register perpanjangan. Abaikan pemberitahuan ini apabila proses perpanjangan sudah dilakukan. Terima kasih atas perhatian dan kerja samanya.
        </p>

        <div class="footer">
          Sistem Monitoring Temporary Power - SPARK<br>
          Jl. Jend. Gatot Subroto Kav. 38, Jakarta 12710
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendMail({
    to: toEmail,
    cc: ccEmail,
    subject,
    html,
  });

  await db.notificationLog.create({
    data: {
      subscriptionId: sub.id,
      channel: "EMAIL",
      status: result.success ? "SENT" : "FAILED",
      type: "DUE_SOON",
      triggerType: "MANUAL",
      recipient: toEmail,
      subject,
      message: html,
      sentAt: new Date(),
      errorMessage: result.error,
    },
  });

  await recordAuditLog({
    userId: actorUserId,
    action: "SEND_MANUAL_REMINDER",
    entityType: "Subscription",
    entityId: sub.id,
    newValue: { recipient: toEmail, cc: ccEmail, success: result.success },
  });

  return result;
}
