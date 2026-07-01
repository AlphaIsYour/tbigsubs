import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateCustomerSchema } from "@/lib/validation";
import {
  getCustomerById,
  softDeleteCustomer,
  updateCustomer,
} from "@/services/customer.service";

export async function GET(
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

  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    return NextResponse.json(
      { success: false, error: "not_found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: customer });
}

export async function PATCH(
  req: NextRequest,
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
  const body = await req.json();
  const parsed = updateCustomerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const userId = (session.user as { id?: string }).id;

  try {
    const customer = await updateCustomer(id, parsed.data, userId);
    return NextResponse.json({ success: true, data: customer });
  } catch {
    return NextResponse.json(
      { success: false, error: "not_found" },
      { status: 404 },
    );
  }
}

export async function DELETE(
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
  if (role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "forbidden" },
      { status: 403 },
    );
  }

  const { id } = await params;
  const userId = (session.user as { id?: string }).id;

  try {
    await softDeleteCustomer(id, userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "not_found" },
      { status: 404 },
    );
  }
}
