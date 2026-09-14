import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import sharp from "sharp";

export interface Template2Data {
  certCode: string;
  institutionName: string;
  programName: string;
  description: string;
  issuedDate: Date;
  verifyHash: string;
  signerRightName: string;
}

// Kanvas A4 landscape: 841.89 x 595.28. Logo, border emas, watermark, dan
// semua garis sudah ada di bg-template-2.jpg — kode hanya menaruh teks.
// Koordinat garis diukur dari file JPG (1123x793, skala 0.75):
// - garis tengah: pdfY=350.6, x 76.5-770.7
// - garis ttd kiri: pdfY=87.1, x 128.9-440.8 | kanan: pdfY=87.1, x 499.3-689
// - border emas: kiri pdfX=32.2, kanan pdfX=808.9, bawah pdfY=25.5
const LAYOUT = {
  title: { y: 465, fontSize: 45 },
  certNo: { y: 440, fontSize: 14 },
  givenTo: { y: 410, fontSize: 14 },
  institution: { y: 365, fontSize: 36, maxWidth: 640 },
  intro: { y: 330, fontSize: 13 },
  program: { startY: 300, fontSize: 22, maxWidth: 600 },
  description: { startY: 262, fontSize: 13, maxWidth: 640 },
  placeDate: { y: 208, fontSize: 13 },
  sign: {
    lineY: 87.1,
    leftCenterX: 284.9,
    leftLineWidth: 311,
    rightCenterX: 594.2,
    rightLineWidth: 189,
    nameY: 71,
    nameFontSize: 11,
    titleY: 57,
    titleFontSize: 11,
  },
  qr: { x: 48, y: 38, size: 70 },
};

// Penandatangan kiri hardcode (tidak inputable)
export const SIGNER_LEFT_NAME = "Ferry Hermansyah, SH, MBA, CIB, CRP, CRM, FRM";
const SIGNER_LEFT_TITLE = "Pengajar";
const SIGNER_RIGHT_TITLE = "Direktur";

function wrapText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(testLine, fontSize) > maxWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function fitFontSize(text: string, font: PDFFont, startSize: number, maxWidth: number): number {
  let size = startSize;
  while (size > 16 && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 1;
  }
  return size;
}

function formatIndonesianDate(date: Date): { city: string; formatted: string } {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const d = new Date(date);
  return { city: "Jakarta", formatted: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}` };
}

export async function generateTemplate2Pdf(
  data: Template2Data
): Promise<{ pdfPath: string; qrCodeDataUrl: string }> {
  const domain = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${domain}/verify/${data.verifyHash}`;

  const qrBuffer = await QRCode.toBuffer(verifyUrl, {
    margin: 1,
    width: 200,
    errorCorrectionLevel: "H",
  });
  const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 200,
    errorCorrectionLevel: "H",
  });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  pdfDoc.registerFontkit(fontkit);
  const fontCinzelPath = path.join(process.cwd(), "public", "certificate-assets", "templates", "Cinzel-Bold.ttf");
  let fontCinzelBold = fontHelveticaBold;
  if (fs.existsSync(fontCinzelPath)) {
    fontCinzelBold = await pdfDoc.embedFont(fs.readFileSync(fontCinzelPath));
  }

  const colorNavy = rgb(15 / 255, 23 / 255, 42 / 255);
  const colorBlack = rgb(0, 0, 0);
  const colorGold = rgb(145 / 255, 114 / 255, 36 / 255);

  // Background full-bleed template-2
  const bgPath = path.join(
    process.cwd(), "public", "certificate-assets", "templates", "template-2", "bg-template-2.jpg"
  );
  if (!fs.existsSync(bgPath)) {
    throw new Error("Background template-2 tidak ditemukan");
  }
  const compressedBg = await sharp(fs.readFileSync(bgPath))
    .resize(1684, 1190, { fit: "fill" })
    .jpeg({ quality: 82, progressive: true })
    .toBuffer();
  page.drawImage(await pdfDoc.embedJpg(compressedBg), { x: 0, y: 0, width, height });

  const centered = (text: string, font: PDFFont, size: number, y: number) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - w) / 2, y, size, font, color: colorNavy });
  };

  // Judul + nomor + penerima
  const title = "SERTIFIKAT";
  page.drawText(title, {
    x: (width - fontCinzelBold.widthOfTextAtSize(title, LAYOUT.title.fontSize)) / 2,
    y: LAYOUT.title.y,
    size: LAYOUT.title.fontSize,
    font: fontCinzelBold,
    color: colorBlack,
  });
  centered(`No. Sertifikat : ${data.certCode}`, fontHelvetica, LAYOUT.certNo.fontSize, LAYOUT.certNo.y);
  centered("Diberikan Kepada", fontHelvetica, LAYOUT.givenTo.fontSize, LAYOUT.givenTo.y);

  // Nama (shrink-to-fit; garis bawah sudah ada di background, jangan gambar lagi)
  const nameSize = fitFontSize(data.institutionName, fontCinzelBold, LAYOUT.institution.fontSize, LAYOUT.institution.maxWidth);
  const nameWidth = fontCinzelBold.widthOfTextAtSize(data.institutionName, nameSize);
  const nameX = (width - nameWidth) / 2;
  page.drawText(data.institutionName, {
    x: nameX, y: LAYOUT.institution.y, size: nameSize, font: fontCinzelBold, color: colorNavy,
  });

  centered("Atas partisipasi dan keberhasilan dalam mengikuti", fontHelvetica, LAYOUT.intro.fontSize, LAYOUT.intro.y);

  // Program (gold, uppercase, wrap)
  const programLines = wrapText(data.programName.toUpperCase(), LAYOUT.program.maxWidth, fontHelveticaBold, LAYOUT.program.fontSize);
  const progSpacing = LAYOUT.program.fontSize * 1.35;
  const progStartY = LAYOUT.program.startY + ((programLines.length - 1) * progSpacing) / 2;
  programLines.forEach((line, i) => {
    const w = fontHelveticaBold.widthOfTextAtSize(line, LAYOUT.program.fontSize);
    page.drawText(line, {
      x: (width - w) / 2, y: progStartY - i * progSpacing,
      size: LAYOUT.program.fontSize, font: fontHelveticaBold, color: colorGold,
    });
  });

  // Deskripsi
  const descLines = wrapText(data.description, LAYOUT.description.maxWidth, fontHelvetica, LAYOUT.description.fontSize);
  const descSpacing = LAYOUT.description.fontSize * 1.4;
  const descStartY = LAYOUT.description.startY + ((descLines.length - 1) * descSpacing) / 2;
  descLines.forEach((line, i) => {
    const w = fontHelvetica.widthOfTextAtSize(line, LAYOUT.description.fontSize);
    page.drawText(line, {
      x: (width - w) / 2, y: descStartY - i * descSpacing,
      size: LAYOUT.description.fontSize, font: fontHelvetica, color: colorNavy,
    });
  });

  // Kota + tanggal
  const { city, formatted } = formatIndonesianDate(data.issuedDate);
  const placeText = `${city}, ${formatted}`;
  page.drawText(placeText, {
    x: (width - fontHelveticaBold.widthOfTextAtSize(placeText, LAYOUT.placeDate.fontSize)) / 2,
    y: LAYOUT.placeDate.y,
    size: LAYOUT.placeDate.fontSize,
    font: fontHelveticaBold,
    color: colorBlack,
  });

  // Tanda tangan 2 kolom: nama + jabatan di BAWAH garis background,
  // masing-masing center terhadap garisnya
  const drawSignColumn = (centerX: number, lineWidth: number, name: string, title: string) => {
    const nameSize = fitFontSize(name, fontHelvetica, LAYOUT.sign.nameFontSize, lineWidth);
    const nameW = fontHelvetica.widthOfTextAtSize(name, nameSize);
    page.drawText(name, {
      x: centerX - nameW / 2, y: LAYOUT.sign.nameY,
      size: nameSize, font: fontHelvetica, color: colorBlack,
    });
    const titleW = fontHelvetica.widthOfTextAtSize(title, LAYOUT.sign.titleFontSize);
    page.drawText(title, {
      x: centerX - titleW / 2, y: LAYOUT.sign.titleY,
      size: LAYOUT.sign.titleFontSize, font: fontHelvetica, color: colorBlack,
    });
  };
  drawSignColumn(LAYOUT.sign.leftCenterX, LAYOUT.sign.leftLineWidth, SIGNER_LEFT_NAME, SIGNER_LEFT_TITLE);
  drawSignColumn(LAYOUT.sign.rightCenterX, LAYOUT.sign.rightLineWidth, data.signerRightName, SIGNER_RIGHT_TITLE);

  // QR pojok kiri bawah
  page.drawImage(await pdfDoc.embedPng(qrBuffer), {
    x: LAYOUT.qr.x, y: LAYOUT.qr.y, width: LAYOUT.qr.size, height: LAYOUT.qr.size,
  });

  const dirPath = path.join(process.cwd(), "public", "uploads", "certificates");
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const randomPart = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const filename = `${randomPart}-${Date.now()}.pdf`;
  fs.writeFileSync(path.join(dirPath, filename), await pdfDoc.save());

  return { pdfPath: `/uploads/certificates/${filename}`, qrCodeDataUrl };
}
