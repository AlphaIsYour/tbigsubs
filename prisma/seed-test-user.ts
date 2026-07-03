import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Mendaftarkan customer test dan data langganan...");

  // 1. Dapatkan admin
  const admin = await db.user.findFirst({
    where: { email: "admin@company.local" },
  });
  if (!admin) {
    throw new Error("Admin user not found. Please run main seed first.");
  }

  // 2. Dapatkan plan
  const plan = await db.subscriptionPlan.findFirst({
    where: { name: "Paket Bulanan Standar" },
  });
  if (!plan) {
    throw new Error("Plan 'Paket Bulanan Standar' not found.");
  }

  // 3. Upsert Customer dengan email user
  const customer = await db.customer.upsert({
    where: { code: "CUST-TEST-ALPHA" },
    update: {
      email: "alphrenoorz@gmail.com",
      name: "Alpha Test Customer",
    },
    create: {
      code: "CUST-TEST-ALPHA",
      name: "Alpha Test Customer",
      email: "alphrenoorz@gmail.com",
      phone: "081234567890",
      address: "Jl. Test No. 1, Jakarta",
      picName: "Alpha PIC",
      picPhone: "081234567891",
      picEmail: "alphrenoorz@gmail.com",
      isPermanent: false,
      isActive: true,
      createdBy: admin.id,
    },
  });
  console.log(`✅ Customer siap: ${customer.email}`);

  // 4. Upsert Site
  const site = await db.site.upsert({
    where: { code: "SITE-TEST-ALPHA" },
    update: {},
    create: {
      code: "SITE-TEST-ALPHA",
      customerId: customer.id,
      name: "Site Test Alpha Utama",
      address: "Jl. Site Test No. 2, Jakarta",
      city: "Jakarta",
      province: "DKI Jakarta",
      isActive: true,
      createdBy: admin.id,
    },
  });
  console.log(`✅ Site siap: ${site.name}`);

  // Hapus sub lama dengan kode test jika ada agar fresh
  await db.subscription.deleteMany({
    where: {
      code: {
        in: [
          "SUB-TEST-H5",
          "SUB-TEST-H1",
          "SUB-TEST-H0",
          "SUB-TEST-OVERDUE",
        ],
      },
    },
  });

  // Hapus log notifikasi lama untuk kode sub lama agar bisa kirim ulang
  // (karena deleteMany cascade / subscriptionId)

  // 5. Buat 4 Subscriptions dengan kondisi hari ini (3 Juli 2026)
  const today = new Date("2026-07-03T12:00:00Z");

  // A. H-5 (Jatuh tempo 8 Juli 2026)
  const dueDateH5 = new Date(today);
  dueDateH5.setDate(today.getDate() + 5);

  const subH5 = await db.subscription.create({
    data: {
      code: "SUB-TEST-H5",
      customerId: customer.id,
      siteId: site.id,
      planId: plan.id,
      type: "MONTHLY",
      status: "ACTIVE",
      startDate: new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000),
      dueDate: dueDateH5,
      amount: Number(plan.price),
      isActive: true,
      createdBy: admin.id,
    },
  });
  console.log(`✅ Sub H-5 dibuat, Jatuh tempo: ${dueDateH5.toISOString().slice(0, 10)}`);

  // B. H-1 (Jatuh tempo 4 Juli 2026)
  const dueDateH1 = new Date(today);
  dueDateH1.setDate(today.getDate() + 1);

  const subH1 = await db.subscription.create({
    data: {
      code: "SUB-TEST-H1",
      customerId: customer.id,
      siteId: site.id,
      planId: plan.id,
      type: "MONTHLY",
      status: "ACTIVE",
      startDate: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
      dueDate: dueDateH1,
      amount: Number(plan.price),
      isActive: true,
      createdBy: admin.id,
    },
  });
  console.log(`✅ Sub H-1 dibuat, Jatuh tempo: ${dueDateH1.toISOString().slice(0, 10)}`);

  // C. H-0 (Jatuh tempo 3 Juli 2026 - hari ini)
  const dueDateH0 = new Date(today);

  const subH0 = await db.subscription.create({
    data: {
      code: "SUB-TEST-H0",
      customerId: customer.id,
      siteId: site.id,
      planId: plan.id,
      type: "MONTHLY",
      status: "ACTIVE",
      startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      dueDate: dueDateH0,
      amount: Number(plan.price),
      isActive: true,
      createdBy: admin.id,
    },
  });
  console.log(`✅ Sub H-0 dibuat, Jatuh tempo: ${dueDateH0.toISOString().slice(0, 10)}`);

  // D. Overdue (Jatuh tempo 1 Juli 2026 - lewat tempo)
  const dueDateOverdue = new Date(today);
  dueDateOverdue.setDate(today.getDate() - 2);

  const subOverdue = await db.subscription.create({
    data: {
      code: "SUB-TEST-OVERDUE",
      customerId: customer.id,
      siteId: site.id,
      planId: plan.id,
      type: "MONTHLY",
      status: "ACTIVE",
      startDate: new Date(today.getTime() - 32 * 24 * 60 * 60 * 1000),
      dueDate: dueDateOverdue,
      amount: Number(plan.price),
      isActive: true,
      createdBy: admin.id,
    },
  });
  console.log(`✅ Sub Overdue dibuat, Jatuh tempo: ${dueDateOverdue.toISOString().slice(0, 10)}`);

  console.log("🎉 Seeding test data sukses.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
