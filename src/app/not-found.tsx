import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 - Halaman Tidak Ditemukan | Sangkala",
  description: "Maaf, halaman yang Anda cari tidak dapat ditemukan.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between p-6 select-none">
      <div className="grow flex flex-col items-center justify-center py-12">
        <div className="max-w-md w-full flex flex-col items-center">
          {/* 404 Big Gradient Number */}
          <h1 className="text-8xl md:text-9xl font-black tracking-widest text-transparent bg-clip-text bg-[#0d5c63] select-none">
            404
          </h1>

          {/* Error Message */}
          <h2 className="mt-4 text-2xl md:text-3xl font-bold text-stone-900 tracking-tight font-sans">
            Halaman Tidak Ditemukan
          </h2>

          {/* Error Description */}
          <p className="mt-4 text-base text-stone-600 font-normal leading-relaxed">
            Maaf, halaman yang Anda tuju tidak tersedia, telah dihapus, atau sedang dalam pemeliharaan. Silakan gunakan tombol di bawah untuk menavigasi.
          </p>

          {/* Button CTA Container */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              href="/"
              className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-[#0d5c63] hover:bg-[#0a4a50] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d5c63] shadow-md shadow-petrol-500/10"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/about"
              className="inline-flex justify-center items-center px-6 py-3 border border-stone-300 text-base font-semibold rounded-xl text-stone-700 bg-white hover:bg-stone-50 hover:text-stone-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d5c63] shadow-sm"
            >
              Tentang Kami
            </Link>
          </div>
        </div>
      </div>

      {/* Mini Footer - Natural Position */}
      <div className="w-full text-center py-4 border-t border-stone-100/50">
        <p className="text-xs text-stone-400">
          &copy; {new Date().getFullYear()} Sangkala. All rights reserved.
        </p>
      </div>
    </div>
  );
}
