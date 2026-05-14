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

  // Check if current route is dashboard
  const isDashboard = pathname?.includes("/dashboard");

  // Dashboard routes don't need navbar/footer (they have their own sidebar)
  if (isDashboard) {
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
