import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  redirect(session?.user ? "/dashboard" : "/login");
}
