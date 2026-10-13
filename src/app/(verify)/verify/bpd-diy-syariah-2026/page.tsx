import type { Metadata } from "next";
import VerifyView from "@/components/certificate/VerifyView";

// ─── Data sertifikat (statis) ───────────────────────────────────────────────
// Data fiktif untuk keperluan portofolio.
const CERTIFICATE = {
  programName: "Pelatihan Perbankan Syariah",
  recipientName: "Bank Contoh A",
  issuedDateLabel: "10 Maret 2026",
  verificationText:
    "Sertifikat Pelatihan Perbankan Syariah untuk peserta Bank Contoh A ini dikeluarkan dan terdaftar di Sangkala tanggal 10 Maret 2026.",
};

export const metadata: Metadata = {
  title: `Verifikasi Sertifikat - ${CERTIFICATE.recipientName} | Sangkala`,
  description: CERTIFICATE.verificationText,
  robots: { index: false, follow: false },
};

export default function VerifyBpdDiySyariahPage() {
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
