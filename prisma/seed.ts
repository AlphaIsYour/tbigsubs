import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const db = new PrismaClient({ adapter });

// ── Helpers ──
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const CITIES = [
  "Jakarta",
  "Surabaya",
  "Bandung",
  "Medan",
  "Semarang",
  "Makassar",
  "Palembang",
  "Tangerang",
  "Depok",
  "Bekasi",
];

const PROVINCES = [
  "DKI Jakarta",
  "Jawa Timur",
  "Jawa Barat",
  "Sumatera Utara",
  "Jawa Tengah",
  "Sulawesi Selatan",
  "Sumatera Selatan",
  "Banten",
  "Jawa Barat",
  "Jawa Barat",
];

const COMPANY_PREFIXES = [
  "PT",
  "CV",
  "UD",
  "Toko",
  "PD",
];

const COMPANY_NAMES = [
  "Maju Jaya",
  "Sentosa Abadi",
  "Karya Mandiri",
  "Sejahtera Bersama",
  "Berkah Utama",
  "Citra Nusantara",
  "Sinar Harapan",
  "Global Teknik",
  "Indah Permata",
  "Makmur Sentral",
  "Lestari Buana",
  "Prima Sakti",
  "Anugerah Jaya",
  "Bintang Timur",
  "Mega Perkasa",
  "Sukses Mandiri",
  "Mitra Abadi",
  "Harmoni Teknik",
  "Cahaya Gemilang",
  "Sarana Utama",
  "Nusantara Teknik",
  "Pratama Solusi",
  "Dinamis Jaya",
  "Kreasi Mandiri",
  "Tunas Mekar",
];

const FIRST_NAMES = [
  "Budi",
  "Sari",
  "Ahmad",
  "Dewi",
  "Rudi",
  "Rina",
  "Agus",
  "Maya",
  "Dedi",
  "Fitri",
  "Hendra",
  "Lina",
  "Joko",
  "Putri",
  "Eko",
  "Ani",
  "Wawan",
  "Siti",
  "Bambang",
  "Ratna",
  "Doni",
  "Yuli",
  "Tono",
  "Wati",
  "Iwan",
];

const LAST_NAMES = [
  "Santoso",
  "Wijaya",
  "Hidayat",
  "Kurniawan",
  "Pratama",
  "Setiawan",
  "Susanto",
  "Hartono",
  "Saputra",
  "Nugroho",
  "Putra",
  "Rahayu",
  "Permana",
  "Utami",
  "Suryanto",
];

const PAYMENT_METHODS = [
  "Transfer Bank",
  "Cash",
  "QRIS",
  "Virtual Account",
  "E-Wallet",
];

async function main() {
  console.log("🌱 Mulai seeding data dummy...\n");

  // ── 1. User admin ──
  const passwordHash = await bcrypt.hash("Admin123!", 10);
  const admin = await db.user.upsert({
    where: { email: "admin@company.local" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@company.local",
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log("✅ User admin siap");

  // ── 2. Subscription Plans ──
  let monthlyPlan = await db.subscriptionPlan.findFirst({
    where: { name: "Paket Bulanan Standar" },
  });
  if (!monthlyPlan) {
    monthlyPlan = await db.subscriptionPlan.create({
      data: {
        name: "Paket Bulanan Standar",
        type: "MONTHLY",
        durationDays: 30,
        price: 500000,
        description: "Paket langganan bulanan standar, berlaku 30 hari",
        isActive: true,
      },
    });
  }

  let monthlyPremium = await db.subscriptionPlan.findFirst({
    where: { name: "Paket Bulanan Premium" },
  });
  if (!monthlyPremium) {
    monthlyPremium = await db.subscriptionPlan.create({
      data: {
        name: "Paket Bulanan Premium",
        type: "MONTHLY",
        durationDays: 30,
        price: 1500000,
        description: "Paket langganan bulanan premium dengan fitur lengkap",
        isActive: true,
      },
    });
  }

  let permanentPlan = await db.subscriptionPlan.findFirst({
    where: { name: "Paket Permanen" },
  });
  if (!permanentPlan) {
    permanentPlan = await db.subscriptionPlan.create({
      data: {
        name: "Paket Permanen",
        type: "PERMANENT",
        durationDays: null,
        price: 0,
        description: "Paket langganan permanen tanpa jatuh tempo berulang",
        isActive: true,
      },
    });
  }

  const plans = [monthlyPlan, monthlyPremium, permanentPlan];
  console.log("✅ Subscription plans siap");

  // ── 3. Customers (25) ──
  const customers = [];
  for (let i = 0; i < 25; i++) {
    const firstName = FIRST_NAMES[i];
    const lastName = pick(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const companyName = `${pick(COMPANY_PREFIXES)} ${COMPANY_NAMES[i]}`;

    const existing = await db.customer.findFirst({
      where: { code: `CUST-${String(i + 1).padStart(3, "0")}` },
    });

    if (existing) {
      customers.push(existing);
      continue;
    }

    const customer = await db.customer.create({
      data: {
        code: `CUST-${String(i + 1).padStart(3, "0")}`,
        name: fullName,
        company: companyName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `08${randomInt(1, 9)}${String(randomInt(10000000, 99999999))}`,
        address: `Jl. ${pick(COMPANY_NAMES)} No.${randomInt(1, 200)}, ${CITIES[i % CITIES.length]}`,
        picName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
        picPhone: `08${randomInt(1, 9)}${String(randomInt(10000000, 99999999))}`,
        picEmail: `pic.${firstName.toLowerCase()}@example.com`,
        isPermanent: i < 5,
        isActive: true,
        createdBy: admin.id,
      },
    });
    customers.push(customer);
  }
  console.log(`✅ ${customers.length} pelanggan siap`);

  // ── 4. Sites (25) ──
  const sites = [];
  for (let i = 0; i < 25; i++) {
    const cityIdx = i % CITIES.length;
    const customer = customers[i % customers.length];

    const existing = await db.site.findFirst({
      where: { code: `SITE-${String(i + 1).padStart(3, "0")}` },
    });

    if (existing) {
      sites.push(existing);
      continue;
    }

    const site = await db.site.create({
      data: {
        code: `SITE-${String(i + 1).padStart(3, "0")}`,
        customerId: customer.id,
        name: `Site ${CITIES[cityIdx]} ${i + 1}`,
        address: `Jl. Raya ${pick(COMPANY_NAMES)} Km.${randomInt(1, 50)}, ${CITIES[cityIdx]}`,
        city: CITIES[cityIdx],
        province: PROVINCES[cityIdx],
        latitude: -6.2 + Math.random() * 2,
        longitude: 106.8 + Math.random() * 3,
        isActive: true,
        createdBy: admin.id,
      },
    });
    sites.push(site);
  }
  console.log(`✅ ${sites.length} site siap`);

  // ── 5. Contractors (25) ──
  const contractors = [];
  for (let i = 0; i < 25; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);

    const existing = await db.contractor.findFirst({
      where: { code: `KONTR-${String(i + 1).padStart(3, "0")}` },
    });

    if (existing) {
      contractors.push(existing);
      continue;
    }

    const contractor = await db.contractor.create({
      data: {
        code: `KONTR-${String(i + 1).padStart(3, "0")}`,
        name: `${pick(COMPANY_PREFIXES)} ${pick(COMPANY_NAMES)} Teknik`,
        company: `${pick(COMPANY_PREFIXES)} ${pick(COMPANY_NAMES)}`,
        email: `kontraktor${i + 1}@example.com`,
        phone: `08${randomInt(1, 9)}${String(randomInt(10000000, 99999999))}`,
        address: `Jl. ${pick(COMPANY_NAMES)} Blok ${String.fromCharCode(65 + (i % 26))}${randomInt(1, 50)}, ${pick(CITIES)}`,
        picName: `${firstName} ${lastName}`,
        picPhone: `08${randomInt(1, 9)}${String(randomInt(10000000, 99999999))}`,
        isActive: true,
        createdBy: admin.id,
      },
    });
    contractors.push(contractor);
  }
  console.log(`✅ ${contractors.length} kontraktor siap`);

  // ── 6. Subscriptions (25) ──
  const now = new Date();
  const subscriptions = [];
  const statuses: Array<"ACTIVE" | "DUE_SOON" | "OVERDUE"> = [
    "ACTIVE",
    "ACTIVE",
    "ACTIVE",
    "DUE_SOON",
    "OVERDUE",
  ];

  for (let i = 0; i < 25; i++) {
    const existing = await db.subscription.findFirst({
      where: { code: `SUB-${String(i + 1).padStart(3, "0")}` },
    });

    if (existing) {
      subscriptions.push(existing);
      continue;
    }

    const isPermanent = i < 5;
    const plan = isPermanent ? permanentPlan : pick([monthlyPlan, monthlyPremium]);
    const status = isPermanent ? "ACTIVE" : pick(statuses);
    const startDate = randomDate(addDays(now, -180), addDays(now, -30));
    let dueDate: Date | null = null;

    if (!isPermanent) {
      if (status === "OVERDUE") {
        dueDate = addDays(now, -randomInt(1, 30));
      } else if (status === "DUE_SOON") {
        dueDate = addDays(now, randomInt(1, 5));
      } else {
        dueDate = addDays(now, randomInt(10, 30));
      }
    }

    const sub = await db.subscription.create({
      data: {
        code: `SUB-${String(i + 1).padStart(3, "0")}`,
        customerId: customers[i % customers.length].id,
        siteId: sites[i % sites.length].id,
        contractorId: i % 3 === 0 ? contractors[i % contractors.length].id : null,
        planId: plan.id,
        type: isPermanent ? "PERMANENT" : "MONTHLY",
        status,
        startDate,
        dueDate,
        amount: Number(plan.price),
        autoRenew: !isPermanent && Math.random() > 0.5,
        isActive: true,
        createdBy: admin.id,
      },
    });
    subscriptions.push(sub);
  }
  console.log(`✅ ${subscriptions.length} langganan siap`);

  // ── 7. Invoices (25) ──
  const invoices = [];
  for (let i = 0; i < 25; i++) {
    const sub = subscriptions[i % subscriptions.length];
    const periodStart = randomDate(addDays(now, -150), addDays(now, -30));
    const periodEnd = addDays(periodStart, 30);
    const invDueDate = addDays(periodEnd, 7);
    const isPaid = Math.random() > 0.4;

    const existingInv = await db.invoice.findFirst({
      where: { invoiceNumber: `INV-${String(i + 1).padStart(4, "0")}` },
    });

    if (existingInv) {
      invoices.push(existingInv);
      continue;
    }

    const inv = await db.invoice.create({
      data: {
        subscriptionId: sub.id,
        invoiceNumber: `INV-${String(i + 1).padStart(4, "0")}`,
        periodStart,
        periodEnd,
        amount: Number(sub.amount),
        status: isPaid ? "PAID" : "PENDING",
        dueDate: invDueDate,
      },
    });
    invoices.push(inv);
  }
  console.log(`✅ ${invoices.length} invoice siap`);

  // ── 8. Payments (25) ──
  for (let i = 0; i < 25; i++) {
    const inv = invoices[i % invoices.length];
    const sub = subscriptions[i % subscriptions.length];

    const existingPay = await db.payment.findFirst({
      where: { code: `PAY-${String(i + 1).padStart(4, "0")}` },
    });

    if (existingPay) continue;

    const paidAt = randomDate(addDays(now, -120), addDays(now, -1));

    await db.payment.create({
      data: {
        code: `PAY-${String(i + 1).padStart(4, "0")}`,
        invoiceId: inv.id,
        subscriptionId: sub.id,
        amount: Number(sub.amount),
        paidAt,
        method: pick(PAYMENT_METHODS),
        reference: `REF${randomInt(100000, 999999)}`,
        status: "PAID",
        recordedBy: admin.id,
      },
    });
  }
  console.log("✅ 25 pembayaran siap");

  // ── 9. Billing Cycles (25) ──
  for (let i = 0; i < 25; i++) {
    const sub = subscriptions[i % subscriptions.length];
    if (sub.type === "PERMANENT") continue;

    const cycleStart = randomDate(addDays(now, -150), addDays(now, -30));
    const cycleEnd = addDays(cycleStart, 30);
    const cycleDue = addDays(cycleEnd, 7);
    const isPaid = Math.random() > 0.3;

    await db.billingCycle.create({
      data: {
        subscriptionId: sub.id,
        cycleNumber: i + 1,
        startDate: cycleStart,
        endDate: cycleEnd,
        dueDate: cycleDue,
        amount: Number(sub.amount),
        status: isPaid ? "PAID" : "PENDING",
        paidAt: isPaid ? randomDate(cycleStart, cycleDue) : null,
      },
    });
  }
  console.log("✅ Billing cycles siap");

  // ── 10. Notification Logs (25) ──
  const triggerTypes = ["OVERDUE", "H-5", "H-3", "H-1", "H-0"];
  for (let i = 0; i < 25; i++) {
    const sub = subscriptions[i % subscriptions.length];
    const customer = customers[i % customers.length];
    const sentDate = randomDate(addDays(now, -90), now);
    const isSent = Math.random() > 0.2;

    await db.notificationLog.create({
      data: {
        subscriptionId: sub.id,
        channel: "EMAIL",
        type: i % 3 === 0 ? "OVERDUE" : i % 3 === 1 ? "H1" : "DUE_SOON",
        triggerType: `${pick(triggerTypes)}:${sentDate.toISOString().slice(0, 10)}`,
        recipient: customer.email,
        recipientName: customer.name,
        subject: `Pengingat Tagihan - ${customer.name}`,
        message: `<p>Yth. ${customer.name}, langganan Anda segera jatuh tempo.</p>`,
        status: isSent ? "SENT" : "FAILED",
        sentAt: isSent ? sentDate : null,
        errorMessage: isSent ? null : "Connection timeout",
      },
    });
  }
  console.log("✅ 25 notifikasi siap");

  // ── 11. Audit Logs (25) ──
  const actions = ["CREATE", "UPDATE", "DELETE", "LOGIN", "EXPORT"];
  const entityTypes = [
    "Customer",
    "Site",
    "Contractor",
    "Subscription",
    "Payment",
    "Invoice",
  ];

  for (let i = 0; i < 25; i++) {
    await db.auditLog.create({
      data: {
        userId: admin.id,
        userEmail: admin.email,
        action: pick(actions),
        entityType: pick(entityTypes),
        entityId: customers[i % customers.length].id,
        ipAddress: `192.168.1.${randomInt(1, 254)}`,
        userAgent: "Mozilla/5.0 Seed Script",
        createdAt: randomDate(addDays(now, -60), now),
      },
    });
  }
  console.log("✅ 25 audit logs siap");

  // ── 12. Reminder Rules ──
  const existingRules = await db.reminderRule.count();
  if (existingRules === 0) {
    const rules = [
      {
        name: "Pengingat H-5",
        type: "DUE_SOON" as const,
        daysBeforeDue: 5,
        templateSubject: "Pengingat: Tagihan akan jatuh tempo dalam 5 hari",
        templateBody: "Yth. {{customer_name}}, tagihan Anda akan jatuh tempo dalam 5 hari.",
      },
      {
        name: "Pengingat H-3",
        type: "DUE_SOON" as const,
        daysBeforeDue: 3,
        templateSubject: "Pengingat: Tagihan akan jatuh tempo dalam 3 hari",
        templateBody: "Yth. {{customer_name}}, tagihan Anda akan jatuh tempo dalam 3 hari.",
      },
      {
        name: "Pengingat H-1",
        type: "H1" as const,
        daysBeforeDue: 1,
        templateSubject: "Pengingat: Tagihan jatuh tempo besok!",
        templateBody: "Yth. {{customer_name}}, tagihan Anda jatuh tempo besok.",
      },
      {
        name: "Peringatan Jatuh Tempo",
        type: "OVERDUE" as const,
        daysBeforeDue: 0,
        templateSubject: "Peringatan: Tagihan telah jatuh tempo",
        templateBody: "Yth. {{customer_name}}, tagihan Anda telah melewati jatuh tempo.",
      },
    ];

    for (const rule of rules) {
      await db.reminderRule.create({
        data: {
          ...rule,
          channel: "EMAIL",
          isActive: true,
        },
      });
    }
    console.log("✅ 4 reminder rules siap");
  }

  console.log("\n🎉 Seeding selesai! Semua data dummy telah dibuat.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
