import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// ─── Sample Data (hardcoded sementara) ──────────────────────────────────────
interface SignatureData {
  id: string;
  companyName: string;
  companyLabel: string;
  email: string;
  phone: string;
  address: string;
  pic: string;
  trainers: string;
  trainingTitle: string;
  printedDate: string;
  createdDate: string;
  trainingCategory: string;
  registrationNumber: string;
  venue: string;
  trainingDate: string;
  trainingProvider: string;
  trainingType: string;
  submittedBy: string;
  signers: { role: string; name: string }[];
  competencyUnits: { code: string; title: string }[];
  certificateLabel: string;
}

const sampleData: Record<string, SignatureData> = {
  "LNA-2026-001": {
    id: "LNA-2026-001",
    companyName: "PT. Leadership Nasional Asia (LNA)",
    companyLabel: "Training Provider",
    email: "leadership.nasional@gmail.com",
    phone: "+622112915804",
    address:
      "Talavera Office Park Lt. 28, Jl. TB Simatupang Kav 22-26 Jakarta Selatan 12430",
    pic: "Ferry Hermansyah (+6281808754027)",
    trainers:
      "Ferry Hermansyah, SH, MBA, CIB, CRP, FRM., Feddy Febriansyah SH, MH., Davina Jeihan Zafira dan Jasmine Chantika Putri, S.P.W.K.",
    trainingTitle:
      "Pelatihan Berbasis Kompetensi Sertifikasi Manajemen Risiko Jenjang 4",
    printedDate: "Selasa, 31 Mar 2026, 12:33 WIB",
    createdDate: "Selasa, 31 Mar 2026, 12:33 WIB",
    trainingCategory: "Program Pembekalan",
    registrationNumber: "1767678050217",
    venue: "Online",
    trainingDate: "Sen, 05 Jan 2026 - Sel, 06 Jan 2026",
    trainingProvider: "PT. Leadership Nasional Asia (LNA)",
    trainingType: "-",
    submittedBy: "-",
    signers: [
      { role: "Direktur: Ir. Pipip Sasati", name: "" },
      { role: "Ketua BSMR: Prof. Dr. Ir. Gandung Troy S., M.Si.", name: "" },
    ],
    competencyUnits: [
      { code: "KGMRP00.005.2", title: "Mengelola Risiko Likuiditas" },
      { code: "KGMRP00.013.2", title: "Mengelola Risiko Operasional" },
      { code: "KGMRP00.007", title: "Mengelola Risiko Kredit" },
      { code: "KGMRP00.006.2", title: "Mengelola Risiko Pasar" },
      { code: "KGMRP00.016.1", title: "Mengelola Risiko Investasi" },
      { code: "KGMRP00.017.1", title: "Mengelola Risiko Imbal Hasil" },
    ],
    certificateLabel: "Sertifikat Program Pembekalan",
  },
};

// ─── Metadata ───────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = sampleData[id];
  if (!data) {
    return { title: "Tidak Ditemukan | Leadership Nasional Asia" };
  }
  return {
    title: `Verifikasi Tanda Tangan - ${data.id} | BSMR`,
    description: `Verifikasi tanda tangan digital untuk ${data.trainingTitle}`,
    robots: { index: false, follow: false },
  };
}

// ─── Page Component ─────────────────────────────────────────────────────────
export default async function VerifySignaturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = sampleData[id];

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col font-sans">

      {/* ── Top Verification Banner ── */}
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e3a5f] text-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-start sm:items-center gap-3">
          <div className="mt-0.5 sm:mt-0 flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed">
            <span className="font-semibold text-emerald-400">
              Tanda tangan terverifikasi.
            </span>{" "}
            Konfirmasi tandatangan ini adalah untuk kepentingan validasi program
            pembekalan atau program pengkajian atau program pelatihan berbasis
            kompetensi dalam rangka Sertifikasi Manajemen Risiko.
          </p>
        </div>
      </div>

      {/* ── Main Container ── */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">

        {/* ── SECTION 1: Company Info (Card Atas) ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="p-8 lg:p-12">

            {/* Logo & Company Name Centered */}
            <div className="flex flex-col items-center mb-12">
              <div className="relative w-24 h-24 mb-4 rounded-full border border-gray-100 p-2 shadow-sm">
                <Image
                  src="/logo-lna.png" // Pastikan menggunakan image logo yang bundar/sesuai
                  alt="LNA"
                  fill
                  className="object-contain p-2"
                />
              </div>
              <span className="inline-block px-3 py-1 text-xs text-[#0ea5e9] bg-[#f0f9ff] border border-[#bae6fd] rounded-md mb-2">
                {data.companyLabel}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-black text-center">
                {data.companyName}
              </h2>
            </div>

            {/* Grid Data Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-6xl mx-auto">
              {/* Kiri */}
              <div className="flex flex-col gap-y-6">
                <InfoItem label="Email" value={data.email} />
                <InfoItem label="Nomor Telepon" value={data.phone} />
                <InfoItem label="Alamat" value={data.address} />
              </div>
              {/* Kanan */}
              <div className="flex flex-col gap-y-6">
                <InfoItem label="PIC" value={data.pic} />
                <InfoItem label="Pelatih" value={data.trainers} />
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: Training Details (Card Bawah) ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-12">
          <div className="p-8 lg:p-12">

            {/* Title & Dates */}
            <div className="mb-10">
              <h1 className="text-xl sm:text-2xl font-bold text-black mb-2">
                {data.trainingTitle}
              </h1>
              <div className="text-sm text-gray-500 flex flex-col gap-0.5">
                <span>Diperiksa: {data.printedDate}</span>
                <span>Dibuat: {data.createdDate}</span>
              </div>
            </div>

            {/* 6-Column Grid for Training Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-x-6 gap-y-8 mb-10">
              {/* Kategori Pelatihan */}
              <div>
                <span className="block text-xs font-semibold text-gray-900 mb-2">Kategori Pelatihan</span>
                <span className="inline-block px-2.5 py-1 text-xs text-[#2563eb] bg-[#eff6ff] border border-[#bfdbfe] rounded">
                  {data.trainingCategory}
                </span>
              </div>

              {/* Nomor Registrasi */}
              <DetailItem label="Nomor Registrasi Pelatihan" value={data.registrationNumber} />

              {/* Sarana */}
              <DetailItem label="Sarana Pelatihan" value={data.venue} />

              {/* Tanggal */}
              <div>
                <span className="block text-xs font-semibold text-gray-900 mb-2">Tanggal Pelatihan</span>
                <span className="block text-sm text-gray-600 underline decoration-gray-300 underline-offset-4">
                  {data.trainingDate}
                </span>
              </div>

              {/* Training Provider */}
              <div>
                <span className="block text-xs font-semibold text-gray-900 mb-2">Training Provider</span>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 relative flex-shrink-0 mt-0.5">
                    <Image src="/logo-lna-transparent.png" alt="LNA" fill className="object-contain" />
                  </div>
                  <Link href="/" className="text-sm text-[#2563eb] underline underline-offset-4 hover:text-blue-700">
                    {data.trainingProvider}
                  </Link>
                </div>
              </div>

              {/* Bentuk Pelatihan */}
              <DetailItem label="Bentuk Pelatihan" value={data.trainingType} />
            </div>

            {/* Diajukan Oleh */}
            <div className="mb-10">
              <span className="block text-sm font-bold text-black mb-2">Diajukan Oleh</span>
              <span className="text-sm text-gray-600">{data.submittedBy || "-"}</span>
            </div>

            {/* Penanda Tangan */}
            <div className="mb-10">
              <span className="block text-sm font-bold text-black mb-3">Penanda Tangan</span>
              <div className="flex flex-wrap gap-3">
                {data.signers.map((signer, idx) => (
                  <div key={idx} className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md bg-white shadow-sm">
                    {signer.role}
                  </div>
                ))}
              </div>
            </div>

            {/* Unit Kompetensi (Tetap dipertahankan dengan desain minimalis) */}
            <div>
              <span className="block text-sm font-bold text-black mb-4">Unit Kompetensi</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
                {data.competencyUnits.map((unit, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="font-semibold text-gray-900 min-w-[110px]">{unit.code}</span>
                    <span className="text-gray-600">{unit.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sertifikat */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <span className="block text-sm font-bold text-black mb-3">Akan diterbitkan</span>
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60 rounded-lg px-5 py-3">
                <span className="text-sm font-medium text-slate-700">
                  {data.certificateLabel}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image
              src="/logo-lna-transparent.png"
              alt="LNA"
              width={28}
              height={28}
              className="object-contain opacity-60"
            />
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
              Leadership Nasional Asia
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Halaman ini hanya dapat diakses melalui QR Code pada sertifikat resmi.
          </p>
        </div>

      </div>
    </div>
  );
}

// ─── Sub-Components Minimalis (Tanpa Ikon) ─────────────────────────────────

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className="text-sm text-gray-800 leading-relaxed">{value || "-"}</span>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-gray-900">{label}</span>
      <span className="text-sm text-gray-600 leading-relaxed">{value || "-"}</span>
    </div>
  );
}