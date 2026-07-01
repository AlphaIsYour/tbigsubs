import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createContractorSchema } from "@/lib/validation";
import {
  getContractorById,
  softDeleteContractor,
  updateContractor,
} from "@/services/contractor.service";

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
  const contractor = await getContractorById(id);

  if (!contractor) {
    return NextResponse.json(
      { success: false, error: "not_found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: contractor });
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
  const parsed = createContractorSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const userId = (session.user as { id?: string }).id;

  try {
    const contractor = await updateContractor(id, parsed.data, userId);
    return NextResponse.json({ success: true, data: contractor });
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
    await softDeleteContractor(id, userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "not_found" },
      { status: 404 },
    );
  }
}
