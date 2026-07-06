import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendManualReminder } from "@/services/reminder.service";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "OPERATOR") {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  const { id } = await params;
  const userId = (session.user as { id?: string }).id;

  try {
    const result = await sendManualReminder(id, userId);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Gagal mengirim email pengingat" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email pengingat berhasil dikirim secara manual",
    });
  } catch (error: any) {
    console.error("Gagal mengirim pengingat manual:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan internal" },
      { status: 500 },
    );
  }
}
