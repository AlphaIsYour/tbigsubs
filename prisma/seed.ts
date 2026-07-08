import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import * as XLSX from "xlsx";
import * as path from "path";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const db = new PrismaClient({ adapter });

function parseExcelDate(serial: any): Date | null {
  if (!serial) return null;
  const num = Number(serial);
  if (isNaN(num)) {
    const d = new Date(serial);
    return isNaN(d.getTime()) ? null : d;
  }
  const utc_days = Math.floor(num - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return date_info;
}

async function main() {
  console.log("🧹 Membersihkan seluruh data lama di database...");
  
  await db.notificationLog.deleteMany({});
  await db.payment.deleteMany({});
  await db.invoice.deleteMany({});
  await db.billingCycle.deleteMany({});
  await db.subscription.deleteMany({});
  await db.site.deleteMany({});
  await db.contractor.deleteMany({});
  await db.customer.deleteMany({});
  await db.user.deleteMany({});
  await db.auditLog.deleteMany({});

  console.log("✅ Database bersih.");

  console.log("👥 Mendaftarkan akun admin baru...");
  const passwordHash = await bcrypt.hash("Alphareno77", 10);

  const admin1 = await db.user.create({
    data: {
      email: "joko.iswanto@tower-bersama.com",
      name: "Joko Iswanto",
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log("✅ Admin Joko terdaftar.");

  const admin3 = await db.user.create({
    data: {
      email: "alphrenoorz@gmail.com",
      name: "Alpha Admin",
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log("✅ Admin Alpha terdaftar.");

  // Buat default customer
  console.log("🏢 Membuat data pelanggan utama...");
  const customer = await db.customer.create({
    data: {
      code: "PLN-MG",
      name: "PLN Multiguna Client",
      email: "joko.iswanto@tower-bersama.com",
      phone: "021-29248900",
      address: "Gedung Tower Bersama, Jakarta",
      isActive: true,
      createdBy: admin3.id,
    },
  });

  // Buat default plans
  console.log("📦 Membuat paket layanan...");
  const planPermanen = await db.subscriptionPlan.create({
    data: {
      name: "PLN Permanen",
      description: "Paket PLN Permanen Konek",
      type: "PERMANENT",
      price: 0,
      isActive: true,
    },
  });

  const planMultiguna = await db.subscriptionPlan.create({
    data: {
      name: "PLN Multiguna",
      description: "Paket PLN Multiguna (MG)",
      type: "MONTHLY",
      price: 0,
      isActive: true,
    },
  });

  console.log("📊 Membaca file Excel...");
  const filePath = path.join(process.cwd(), "Data PLN Multiguna.xlsx");
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet) as any[];

  let successCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    const siteIdRaw = row.__EMPTY;
    if (!siteIdRaw) continue;
    const siteCode = String(siteIdRaw).trim();

    const siteName = (row.__EMPTY_2 || `Site ${siteCode}`).trim();
    const operatorSiteId = row.__EMPTY_1 ? String(row.__EMPTY_1).trim() : null;
    const picPmoCme = row.__EMPTY_3 ? String(row.__EMPTY_3).trim() : null;
    const progressTower = row.__EMPTY_4 ? String(row.__EMPTY_4).trim() : null;
    const mitraInisial = row.__EMPTY_5 ? String(row.__EMPTY_5).trim() : null;
    const mitraCme = row.__EMPTY_6 ? String(row.__EMPTY_6).trim() : null;
    
    const plnTypeRaw = String(row.__EMPTY_7 || "").trim().toLowerCase();
    const plan = plnTypeRaw.includes("mg") ? planMultiguna : planPermanen;

    const dayaPln = row.__EMPTY_8 ? String(row.__EMPTY_8).trim() : null;
    const mgSuplisiNormal = row.__EMPTY_9 ? String(row.__EMPTY_9).trim() : null;
    
    const tglMulai = parseExcelDate(row["Masa Berlaku MG"]);
    const tglBerakhir = parseExcelDate(row.__EMPTY_10);
    const targetPermanenKonek = parseExcelDate(row.__EMPTY_11);
    
    const plnCustomerId = row.__EMPTY_12 ? String(row.__EMPTY_12).trim() : null;
    const tglNyalaPermanen = parseExcelDate(row.__EMPTY_13);
    const emailMitra = row[" "] ? String(row[" "]).trim() : null;

    let contractorId: string | null = null;
    if (mitraInisial) {
      const contractor = await db.contractor.upsert({
        where: { code: mitraInisial },
        update: {
          name: mitraCme || mitraInisial,
          email: emailMitra || undefined,
        },
        create: {
          code: mitraInisial,
          name: mitraCme || mitraInisial,
          email: emailMitra || undefined,
          isActive: true,
          createdBy: admin3.id,
        },
      });
      contractorId = contractor.id;
    }

    const site = await db.site.upsert({
      where: { code: siteCode },
      update: {
        name: siteName,
        operatorSiteId,
        picPmoCme,
        progressTower,
        dayaPln,
        plnCustomerId,
        tglNyalaPermanen,
      },
      create: {
        code: siteCode,
        customerId: customer.id,
        name: siteName,
        operatorSiteId,
        picPmoCme,
        progressTower,
        dayaPln,
        plnCustomerId,
        tglNyalaPermanen,
        isActive: true,
        createdBy: admin3.id,
      },
    });

    const subCode = `SUB-${siteCode}`;
    await db.subscription.upsert({
      where: { code: subCode },
      update: {
        planId: plan.id,
        type: plan.type,
        startDate: tglMulai || new Date(),
        endDate: tglBerakhir,
        dueDate: tglBerakhir || tglMulai || new Date(),
        mgSuplisiNormal,
        targetPermanenKonek,
        contractorId,
      },
      create: {
        code: subCode,
        customerId: customer.id,
        siteId: site.id,
        contractorId,
        planId: plan.id,
        type: plan.type,
        status: "ACTIVE",
        startDate: tglMulai || new Date(),
        endDate: tglBerakhir,
        dueDate: tglBerakhir || tglMulai || new Date(),
        amount: 0,
        autoRenew: false,
        mgSuplisiNormal,
        targetPermanenKonek,
        isActive: true,
        createdBy: admin3.id,
      },
    });

    successCount++;
  }

  console.log(`🎉 Berhasil memproses ${successCount} data dari file Excel ke database.`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
