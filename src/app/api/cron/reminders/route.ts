import { NextRequest, NextResponse } from "next/server";
import { runReminderJob } from "@/services/reminder.service";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await runReminderJob();

  return NextResponse.json({
    success: true,
    result,
  });
}
