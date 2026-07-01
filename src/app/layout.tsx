import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "Sistem Pengingat Langganan dan Penagihan",
  description: "Internal billing reminder system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
