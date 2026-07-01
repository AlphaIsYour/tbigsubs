import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createInvoice, listInvoices } from "@/services/invoice.service";

const createInvoiceSchema = z.object({
  subscriptionId: z.string().uuid(),
  periodStart: z.string(),
  periodEnd: z.string(),
  amount: z.number().positive(),
  dueDate: z.string(),
});

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

  const result = await listInvoices({
    page,
    pageSize,
    search,
    status: status as Parameters<typeof listInvoices>[0]["status"],
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
  const parsed = createInvoiceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const userId = (session.user as { id?: string }).id;
  const invoice = await createInvoice(parsed.data, userId);

  return NextResponse.json({ success: true, data: invoice }, { status: 201 });
}
