import Image from "next/image";
import { ShieldX } from "lucide-react";

export default function VerifyNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-50 flex items-center justify-center">
          <ShieldX className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-[#0f172a] mb-3">
          Tanda Tangan Tidak Ditemukan
        </h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          ID verifikasi yang Anda masukkan tidak valid atau tidak terdaftar dalam
          sistem kami. Pastikan Anda memindai QR Code langsung dari sertifikat
          resmi Leadership Nasional Asia.
        </p>
        <div className="flex items-center justify-center gap-2 opacity-50">
          <Image
            src="/logo-lna-transparent.png"
            alt="LNA"
            width={24}
            height={24}
            className="object-contain"
          />
          <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
            Leadership Nasional Asia
          </span>
        </div>
      </div>
    </div>
  );
}
