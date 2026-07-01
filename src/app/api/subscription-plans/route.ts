import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { recordAuditLog } from "@/services/audit.service";

const createPlanSchema = z.object({
  name: z.string().min(2).max(150),
  type: z.enum(["PERMANENT", "MONTHLY"]),
  durationDays: z.number().int().positive().optional(),
  price: z.number().nonnegative(),
  description: z.string().max(500).optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  const plans = await db.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: plans });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "forbidden" },
      { status: 403 },
    );
  }

  const body = await req.json();
  const parsed = createPlanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const plan = await db.subscriptionPlan.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      durationDays:
        parsed.data.durationDays ??
        (parsed.data.type === "MONTHLY" ? 30 : null),
      price: parsed.data.price,
      description: parsed.data.description || null,
    },
  });

  const userId = (session.user as { id?: string }).id;
  await recordAuditLog({
    userId,
    action: "CREATE",
    entityType: "SubscriptionPlan",
    entityId: plan.id,
    newValue: plan,
  });

  return NextResponse.json({ success: true, data: plan }, { status: 201 });
}
