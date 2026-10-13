import type { Metadata } from "next";
import VerifyView from "@/components/certificate/VerifyView";

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
    <VerifyView
      data={{
        programName: CERTIFICATE.programName,
        recipientName: CERTIFICATE.recipientName,
        recipientLabel: "Nama Instansi",
        issuedLabel: CERTIFICATE.issuedDateLabel,
        statement: CERTIFICATE.verificationText,
      }}
    />
  );
}
