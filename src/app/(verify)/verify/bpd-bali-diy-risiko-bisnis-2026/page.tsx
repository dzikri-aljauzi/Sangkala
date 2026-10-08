import { Logo } from "@/components/brand/Logo";
import type { Metadata } from "next";
import { CheckCircle } from "lucide-react";

// ─── Data sertifikat (statis) ───────────────────────────────────────────────
// Data fiktif untuk keperluan portofolio.
const CERTIFICATE = {
  programName: "Pelatihan Risiko Bisnis",
  recipientName: "Bank Contoh A dan Bank Contoh B",
  issuedDateLabel: "11 Juli 2026",
  verificationText:
    "Sertifikat Pelatihan Risiko Bisnis untuk peserta Bank Contoh A dan Bank Contoh B ini dikeluarkan dan terdaftar di Sangkala tanggal 11 Juli 2026.",
};

export const metadata: Metadata = {
  title: `Verifikasi Sertifikat - ${CERTIFICATE.recipientName} | Sangkala`,
  description: CERTIFICATE.verificationText,
  robots: { index: false, follow: false },
};

export default function VerifyBpdBaliDiyRisikoBisnisPage() {
  return (
    <div className="min-h-screen bg-[#f2f3f1] flex flex-col font-sans">
      {/* Top Verification Banner */}
      <div className="bg-[#052a2e] text-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
          <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold text-emerald-400">
              Sertifikat Resmi Terverifikasi.
            </span>{" "}
            Sertifikat ini diterbitkan secara sah oleh Sangkala Technology dan terdaftar dalam basis data sertifikasi
            kami.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 grow">
        {/* Section 1: Issuer Info */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-6">
          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center">
              <div className="mb-4"><Logo className="h-12" /></div>
              <span className="inline-block px-3 py-1 text-xs font-semibold text-petrol-600 bg-petrol-50 border border-petrol-100 rounded-md mb-2">
                Lembaga Penerbit
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 text-center">
                Sangkala Technology
              </h2>
            </div>
            <div className="mt-2 text-center max-w-2xl mx-auto border-t border-stone-100 pt-2">
              <p className="text-base sm:text-lg text-stone-700 leading-relaxed font-medium">
                {CERTIFICATE.verificationText}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Certificate details */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="border-b border-stone-100 pb-6 mb-8">
              <span className="text-xs font-mono font-semibold text-petrol-600 tracking-wider">
                SERTIFIKAT PELATIHAN
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                {CERTIFICATE.programName}
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <DetailItem label="Nama Instansi" value={CERTIFICATE.recipientName} />
              <DetailItem
                label="Ruang Lingkup / Deskripsi"
                value={CERTIFICATE.programName}
              />
            </div>

            <div className="border-t border-stone-100 pt-6">
              <DetailItem
                label="Tanggal Terbit & Terdaftar"
                value={CERTIFICATE.issuedDateLabel}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Logo className="h-5 opacity-70" />
          </div>
          <p className="text-xs text-stone-400">
            Halaman ini hanya dapat diakses untuk keperluan verifikasi
            keabsahan sertifikasi resmi.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-bold text-stone-900 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-base text-stone-600 leading-relaxed font-medium">
        {value || "-"}
      </span>
    </div>
  );
}
