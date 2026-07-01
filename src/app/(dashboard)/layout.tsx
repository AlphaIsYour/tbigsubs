import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar
          userName={session.user.name ?? "-"}
          userRole={(session.user as { role?: string }).role ?? "-"}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
