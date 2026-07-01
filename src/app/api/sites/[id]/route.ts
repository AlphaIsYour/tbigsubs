import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSiteSchema } from "@/lib/validation";
import {
  getSiteById,
  softDeleteSite,
  updateSite,
} from "@/services/site.service";

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
  const site = await getSiteById(id);

  if (!site) {
    return NextResponse.json(
      { success: false, error: "not_found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: site });
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
  const parsed = createSiteSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const userId = (session.user as { id?: string }).id;

  try {
    const site = await updateSite(id, parsed.data, userId);
    return NextResponse.json({ success: true, data: site });
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
    await softDeleteSite(id, userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "not_found" },
      { status: 404 },
    );
  }
}
