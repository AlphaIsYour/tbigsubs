import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSubscriptionSchema } from "@/lib/validation";
import {
  createSubscription,
  listSubscriptions,
} from "@/services/subscription.service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const type = searchParams.get("type") ?? undefined;

  const result = await listSubscriptions({
    page,
    pageSize,
    search,
    status,
    type,
  });
  return NextResponse.json({ success: true, data: result });
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
  if (role !== "ADMIN" && role !== "OPERATOR") {
    return NextResponse.json(
      { success: false, error: "forbidden" },
      { status: 403 },
    );
  }

  const body = await req.json();
  const parsed = createSubscriptionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const userId = (session.user as { id?: string }).id;
  const subscription = await createSubscription(
    {
      customerId: parsed.data.customerId,
      siteId: parsed.data.siteId,
      contractorId: parsed.data.contractorId,
      planId: parsed.data.planId,
      type: parsed.data.type,
      startDate: parsed.data.startDate,
      dueDate: parsed.data.dueDate,
      autoRenew: parsed.data.autoRenew,
      notes: parsed.data.notes,
    },
    userId,
  );

  return NextResponse.json(
    { success: true, data: subscription },
    { status: 201 },
  );
}
