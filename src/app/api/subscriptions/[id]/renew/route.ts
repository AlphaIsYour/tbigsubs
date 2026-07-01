import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { renewMonthlySubscription } from "@/services/subscription.service";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  const userId = (session.user as { id?: string }).id;

  try {
    const subscription = await renewMonthlySubscription(id, userId);
    return NextResponse.json({ success: true, data: subscription });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
