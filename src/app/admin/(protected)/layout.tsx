"use client";

import AppShell from "@/components/layout/AppShell";
import { getNavSections } from "@/config/nav";

/**
 * Shared shell untuk seluruh area /admin/* (kecuali /admin/login).
 * Proteksi akses tetap ditangani middleware.ts di server — layout ini
 * murni urusan tampilan: satu shell, nav global untuk role ADMIN.
 */
export default function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell sections={getNavSections("ADMIN")}>{children}</AppShell>;
}
