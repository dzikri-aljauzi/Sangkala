import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 - Halaman Tidak Ditemukan | Leadership Nasional Asia",
  description: "Maaf, halaman yang Anda cari tidak dapat ditemukan.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 flex flex-col justify-between p-6 select-none">
      <div className="grow flex flex-col items-center justify-center py-12">
        <div className="max-w-md w-full flex flex-col items-center">
          {/* 404 Big Gradient Number */}
          <h1 className="text-8xl md:text-9xl font-black tracking-widest text-transparent bg-clip-text bg-linear-to-r from-[#2563eb] to-[#0891b2] select-none">
            404
          </h1>

          {/* Error Message */}
          <h2 className="mt-4 text-2xl md:text-3xl font-bold text-slate-900 tracking-tight font-sans">
            Halaman Tidak Ditemukan
          </h2>

          {/* Error Description */}
          <p className="mt-4 text-base text-slate-600 font-normal leading-relaxed">
            Maaf, halaman yang Anda tuju tidak tersedia, telah dihapus, atau sedang dalam pemeliharaan. Silakan gunakan tombol di bawah untuk menavigasi.
          </p>

          {/* Button CTA Container */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              href="/"
              className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563eb] shadow-md shadow-blue-500/10"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/about"
              className="inline-flex justify-center items-center px-6 py-3 border border-slate-300 text-base font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563eb] shadow-sm"
            >
              Tentang Kami
            </Link>
          </div>
        </div>
      </div>

      {/* Mini Footer - Natural Position */}
      <div className="w-full text-center py-4 border-t border-slate-100/50">
        <p className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Leadership Nasional Asia. All rights reserved.
        </p>
      </div>
    </div>
  );
}
