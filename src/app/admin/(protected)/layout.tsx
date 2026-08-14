"use client";

import { useSession, signOut } from "next-auth/react";
import { Shield, LogOut } from "lucide-react";

// Header admin bersama untuk semua halaman /admin/* (kecuali /admin/login,
// yang sengaja di luar route group ini). Proteksi akses sudah ditangani
// middleware.ts di server sebelum halaman ini dirender — layout ini murni
// urusan tampilan.
export default function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Admin Dashboard</p>
                <p className="text-xs text-slate-500">Leadership Nasional Asia</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-700">{session?.user?.name}</p>
                <p className="text-xs text-slate-500">{session?.user?.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
