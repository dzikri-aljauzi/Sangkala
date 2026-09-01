"use client";

import { useSession } from "next-auth/react";
import AppShell from "@/components/layout/AppShell";
import { getNavSections } from "@/config/nav";

/**
 * Shared shell untuk seluruh area /admin/* (kecuali /admin/login).
 * Proteksi akses tetap ditangani middleware.ts di server — layout ini
 * murni urusan tampilan: satu shell, nav global dinamis sesuai role.
 */
export default function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session } = useSession();
  const role = session?.user?.role || "ADMIN";

  return <AppShell sections={getNavSections(role)}>{children}</AppShell>;
}
