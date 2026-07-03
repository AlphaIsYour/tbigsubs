import "dotenv/config";
import { runReminderJob } from "../src/services/reminder.service";

async function main() {
  console.log("🚀 Menjalankan Reminder Job secara manual...");
  try {
    const result = await runReminderJob();
    console.log("✅ Reminder Job selesai dengan hasil:", result);
  } catch (error) {
    console.error("❌ Terjadi kesalahan saat menjalankan job:", error);
  }
}

main();
