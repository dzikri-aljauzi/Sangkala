import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ParticipantsSearch from "@/components/certificate/ParticipantsSearch";
import { CheckCircle } from "lucide-react";

// ─── Metadata ───────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Try database lookup first
  const certificate = await prisma.certificate.findFirst({
    where: {
      OR: [
        { id },
        { verifyHash: id }
      ]
    }
  });

  if (certificate) {
    return {
      title: `Verifikasi Sertifikat - ${certificate.certCode} | Leadership Nasional Asia`,
      description: `Verifikasi resmi sertifikat untuk ${certificate.recipientName} - ${certificate.programName}`,
      robots: { index: false, follow: false },
    };
  }

  return { title: "Tidak Ditemukan | Leadership Nasional Asia" };
}

// ─── Page Component ─────────────────────────────────────────────────────────
export default async function VerifySignaturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. Try DB Lookup
  const certificate = await prisma.certificate.findFirst({
    where: {
      OR: [
        { id },
        { verifyHash: id }
      ]
    },
    include: {
      participants: {
        orderBy: { name: "asc" }
      }
    }
  });

  if (!certificate) {
    notFound();
  }

  const formattedIssuedDate = new Date(certificate.issuedDate).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col font-sans">
      {/* Top Verification Banner */}
      <div className="bg-linear-to-r from-[#0f172a] to-[#1e3a5f] text-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
          <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold text-emerald-400">Sertifikat Resmi Terverifikasi.</span>{" "}
            Sertifikat ini diterbitkan secara sah oleh PT. Leadership Nasional Asia (LNA) dan terdaftar dalam basis data sertifikasi kami.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 grow">
        
        {/* Section 1: Issuer Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 mb-4 rounded-full border border-gray-100 p-2 shadow-sm flex items-center justify-center bg-slate-50">
                <Image
                  src="/logo-lna.png"
                  alt="LNA Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-md mb-2">
                Lembaga Penerbit
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center">
                PT. Leadership Nasional Asia (LNA)
              </h2>
            </div>
            <div className="mt-2 text-center max-w-2xl mx-auto border-t border-slate-100 pt-2">
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
                Sertifikat ini benar diterbitkan oleh{" "}
                <span className="">Leadership Nasional Asia</span> dalam pelatihan{" "}
                <span className="font-bold text-slate-900">{certificate.programName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Certificate details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
              <div>
                <span className="text-xs font-mono font-semibold text-blue-600 tracking-wider">
                  KODE SERTIFIKAT: {certificate.certCode}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {certificate.programName}
                </h1>
              </div>
            </div>

            <div className={`grid grid-cols-1 ${certificate.maturityLevel ? "md:grid-cols-3" : "md:grid-cols-2"} gap-6 mb-8`}>
              <DetailItem 
                label={certificate.type === "INSTANSI" ? "Nama Instansi" : "Nama Penerima"} 
                value={certificate.recipientName} 
              />
              <DetailItem label="Ruang Lingkup / Deskripsi" value={certificate.description} />
              {certificate.maturityLevel && (
                <DetailItem label="Tingkat Kematangan (Maturity)" value={certificate.maturityLevel} />
              )}
            </div>

            <div className="border-t border-slate-100 pt-6">
              <DetailItem label="Tanggal Terbit" value={formattedIssuedDate} />
            </div>
          </div>
        </div>

        {/* Section 3: Participants (Search component) */}
        {certificate.type === "INSTANSI" && certificate.participants && certificate.participants.length > 0 && (
          <ParticipantsSearch participants={certificate.participants} />
        )}

        {/* Footer */}
        <div className="text-center py-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image
              src="/logo-lna-transparent.png"
              alt="LNA"
              width={28}
              height={28}
              className="object-contain opacity-60"
            />
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
              Leadership Nasional Asia
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Halaman ini hanya dapat diakses untuk keperluan verifikasi keabsahan sertifikasi resmi.
          </p>
        </div>

      </div>
    </div>
  );
}

// ─── Sub-Components Minimalis ─────────────────────────────────

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">{label}</span>
      <span className="text-base text-slate-600 leading-relaxed font-medium">{value || "-"}</span>
    </div>
  );
}