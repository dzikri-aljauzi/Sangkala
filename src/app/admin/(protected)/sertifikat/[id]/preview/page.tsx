import React from "react";
import { prisma } from "@/lib/prisma";
import { getTemplate, parseTemplateData } from "@/lib/certificates/registry";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, ArrowLeft } from "lucide-react";

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function CertificatePreviewPage({ params }: PreviewPageProps) {
  const { id } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      participants: true,
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!certificate) {
    notFound();
  }

  const formatShortDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const issuedDateShort = formatShortDate(certificate.issuedDate);
  const templateDef = getTemplate(certificate.template);
  const signerRightName = parseTemplateData(certificate.templateData).signerRightName;

  return (
    <div className="min-h-screen bg-[#f2f3f1]">
      {/* Top bar */}
      <div className="bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between">
        <Link
          href="/admin/sertifikat"
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-stone-800">Pratinjau Sertifikat PDF</h1>
          {certificate.pdfPath && (
            <a
              href={certificate.pdfPath}
              download
              className="inline-flex items-center gap-2 text-sm font-semibold text-petrol-600 hover:text-petrol-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Unduh PDF
            </a>
          )}
        </div>

        <div className="flex gap-6 items-start">
          {/* Left Sidebar */}
          <div className="w-[300px] shrink-0 space-y-6">
            {/* Certificate Info Card */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-stone-800 mb-5 pb-3 border-b border-stone-100">
                Info Sertifikat
              </h2>

              <div className="space-y-4">
                <InfoRow label="KODE SERTIFIKAT" value={certificate.certCode} mono />
                <InfoRow label="TEMPLATE" value={templateDef.label} bold />
                {signerRightName && (
                  <InfoRow label="PENANDATANGAN KANAN" value={signerRightName} bold />
                )}
                <InfoRow
                  label="NAMA PENERIMA"
                  value={certificate.recipientName}
                  bold
                />

                <div>
                  <span className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                    TANGGAL TERBIT
                  </span>
                  <span className="text-sm font-semibold text-stone-700">
                    {issuedDateShort}
                  </span>
                </div>

                <div className="pt-3 border-t border-stone-100">
                  <span className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                    DITERBITKAN OLEH
                  </span>
                  <p className="text-sm font-bold text-stone-800">
                    {certificate.createdBy?.name || "Super Admin"}
                  </p>
                  <p className="text-xs text-stone-400">
                    {certificate.createdBy?.email || "admin@lna.com"}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Card */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest text-center mb-4">
                QR Code Verifikasi
              </h3>

              <div className="flex justify-center mb-4">
                {certificate.qrCodeData ? (
                  <img
                    src={certificate.qrCodeData}
                    alt="QR Code Verifikasi"
                    width={180}
                    height={180}
                    className="rounded-xl"
                  />
                ) : (
                  <div className="w-[180px] h-[180px] bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 text-xs">
                    Tidak Ada QR Code
                  </div>
                )}
              </div>

              {certificate.qrCodeData && (
                <div className="flex justify-center mb-3">
                  <a
                    href={certificate.qrCodeData}
                    download={`qrcode-${certificate.certCode}.png`}
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-petrol-600 hover:bg-petrol-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Unduh QR Code
                  </a>
                </div>
              )}

              <p className="text-[11px] text-stone-400 text-center leading-relaxed">
                Pindai QR code di atas untuk membuka portal verifikasi publik dan memeriksa{" "}
                <Link
                  href={`/verify/${certificate.verifyHash}`}
                  target="_blank"
                  className="text-petrol-500 underline underline-offset-2 hover:text-petrol-600"
                >
                  keaslian sertifikat
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Right: PDF Viewer */}
          <div className="flex-1 min-w-0">
            <div className="bg-[#525659] rounded-2xl overflow-hidden shadow-lg" style={{ height: "calc(100vh - 180px)", minHeight: "600px" }}>
              {certificate.pdfPath ? (
                <iframe
                  src={certificate.pdfPath}
                  className="w-full h-full border-0"
                  title="Certificate PDF Preview"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50">
                  Tidak Ada PDF
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  bold,
}: {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div>
      <span className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
        {label}
      </span>
      <span
        className={`text-sm text-stone-800 ${mono ? "font-mono font-bold" : ""} ${
          bold ? "font-bold" : "font-medium"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
