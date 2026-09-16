import QRCode from "qrcode";

// Pola persis QR verifikasi sertifikat (src/lib/pdf-generator.ts) -- data URL
// disimpan langsung di kolom DB, tanpa file terpisah. Satu sumber dipakai di
// route create, script backfill, dan endpoint regenerate.
export async function generateTrainingQrCode(trainingId: string): Promise<string> {
  const domain = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const url = `${domain}/info-pelatihan/${trainingId}`;
  return QRCode.toDataURL(url, {
    margin: 1,
    width: 200,
    errorCorrectionLevel: "H",
  });
}
