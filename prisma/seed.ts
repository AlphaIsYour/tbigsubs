import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const db = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("Admin123!", 10);

  await db.user.upsert({
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

  const monthlyPlan = await db.subscriptionPlan.findFirst({
    where: { name: "Paket Bulanan Standar" },
  });

  if (!monthlyPlan) {
    await db.subscriptionPlan.create({
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

  const permanentPlan = await db.subscriptionPlan.findFirst({
    where: { name: "Paket Permanen" },
  });

  if (!permanentPlan) {
    await db.subscriptionPlan.create({
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

  console.log("Seed selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
