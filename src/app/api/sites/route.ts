import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSiteSchema } from "@/lib/validation";
import { createSite, listSites } from "@/services/site.service";

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

  const result = await listSites({ page, pageSize, search });
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
  const parsed = createSiteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const userId = (session.user as { id?: string }).id;
  const site = await createSite(
    {
      customerId: parsed.data.customerId,
      name: parsed.data.name,
      address: parsed.data.address,
      city: parsed.data.city,
      notes: parsed.data.notes,
    },
    userId,
  );

  return NextResponse.json({ success: true, data: site }, { status: 201 });
}
