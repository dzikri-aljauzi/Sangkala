"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AssessmentCenterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Dashboard workspace routes don't need navbar/footer (AppShell provides
  // its own nav): legacy /dashboard + new URL-backed /[view] routes.
  const isWorkspace =
    pathname?.includes("/dashboard") ||
    (!pathname?.endsWith("/login") &&
      /\/assessment-center\/[^/]+\/[a-z-]+$/.test(pathname ?? ""));

  if (isWorkspace) {
    return <>{children}</>;
  }

  // Public routes (list, login) have navbar/footer
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
