import { Logo } from "@/components/brand/Logo";
import { ShieldX } from "lucide-react";

export default function VerifyNotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-50 flex items-center justify-center">
          <ShieldX className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-[#052a2e] mb-3">
          Tanda Tangan Tidak Ditemukan
        </h1>
        <p className="text-sm text-stone-500 mb-8 leading-relaxed">
          ID verifikasi yang Anda masukkan tidak valid atau tidak terdaftar dalam
          sistem kami. Pastikan Anda memindai QR Code langsung dari sertifikat
          resmi Sangkala.
        </p>
        <div className="flex items-center justify-center gap-2 opacity-50">
          <Logo className="h-5 opacity-70" />
        </div>
      </div>
    </div>
  );
}
