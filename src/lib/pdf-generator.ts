import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import sharp from "sharp";

interface CertificateData {
  certCode: string;
  institutionName: string;
  programName: string;
  description: string;
  issuedDate: Date;
  verifyHash: string;
}

// ==========================================
// KONFIGURASI TATA LETAK & UKURAN SERTIFIKAT
// (PDF Ukuran A4 Landscape: 841.89 x 595.28)
// ==========================================
const LAYOUT = {
  // 1. Logo Baris Atas (Profesi, ISO, LNA)
  topLogos: {
    y: 475,
    height: 60,
  },
  
  // 2. Judul Sertifikat
  title: {
    y: 435,
    fontSize: 40,
  },

  // 3. Nama Lembaga / Instansi Penerima
  institution: {
    y: 375,
    fontSize: 39.9,
  },

  // 4. Teks Pernyataan (Program Sertifikasi)
  statement: {
    startY: 345,
    fontSize: 18,
  },

  // 5. Deskripsi / Ruang Lingkup
  validity: {
    startY: 260,
    fontSize: 15,
  },

  // 6. Tanda Tangan & Lokasi Penerbitan
  signature: {
    placeY: 210,
    placeFontSize: 13,
    setByY: 190,
    setByFontSize: 9,
    companyY: 175,
    companyFontSize: 10,
    columnCenter: 495,
  },

  // 7. Badge Emas (logo-erm-iso.png)
  goldBadge: {
    y: 50,
    height: 180,
    aspectRatio: 1.42,
    xAnchor: 490,
    xOffset: 15,
  },

  // 8. QR Code Verifikasi
  qrCode: {
    y: 90,
    size: 72,
  },

  // 9. Catatan Kaki (Footer)
  footer: {
    y: 52,
    fontSize: 8.5,
  }
};

export async function generateCertificatePdf(
  data: CertificateData
): Promise<{ pdfPath: string; qrCodeDataUrl: string }> {
  // 1. Generate QR Code linking to verification page
  const domain = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${domain}/verify/${data.verifyHash}`;
  
  // Generate QR Code as PNG Buffer
  const qrBuffer = await QRCode.toBuffer(verifyUrl, {
    margin: 1,
    width: 200,
    errorCorrectionLevel: "H",
  });
  
  // Generate base64 DataURL for storing in db / displaying on frontend
  const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 200,
    errorCorrectionLevel: "H",
  });

  // 2. Initialize PDF Document (A4 Landscape: 841.89 x 595.28)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  // Load fonts
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Load custom font (Cinzel Bold)
  pdfDoc.registerFontkit(fontkit);
  const fontCinzelPath = path.join(process.cwd(), "public", "certificate-assets", "templates", "Cinzel-Bold.ttf");
  let fontCinzelBold = fontHelveticaBold;
  if (fs.existsSync(fontCinzelPath)) {
    const fontCinzelBytes = fs.readFileSync(fontCinzelPath);
    fontCinzelBold = await pdfDoc.embedFont(fontCinzelBytes);
  }

  // Define Colors
  const colorNavy = rgb(15 / 255, 23 / 255, 42 / 255); // slate-900
  const colorSlate = rgb(71 / 255, 85 / 255, 105 / 255); // slate-600
  const colorBlack = rgb(0, 0, 0); // black

  // 3. Draw Background Template Image
  const bgTemplatePath = path.join(process.cwd(), "public", "certificate-assets", "templates", "bg-template.png");
  if (fs.existsSync(bgTemplatePath)) {
    const bgBytes = fs.readFileSync(bgTemplatePath);
    // Compress background template to a high-quality progressive JPEG buffer
    const compressedBgBytes = await sharp(bgBytes)
      .resize(1684, 1190, { fit: "fill" }) // 2x of A4 Landscape resolution for high-quality printing
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();
    const bgImage = await pdfDoc.embedJpg(compressedBgBytes);
    page.drawImage(bgImage, {
      x: 0,
      y: 0,
      width: width,
      height: height,
    });
  }

  // Load Logos
  const logoIsoPath = path.join(process.cwd(), "public", "certificate-assets", "templates", "logo-iso.png");
  const logoLnaPath = path.join(process.cwd(), "public", "certificate-assets", "templates", "logo-lna.png");
  const logoErmIsoPath = path.join(process.cwd(), "public", "certificate-assets", "templates", "logo-erm-iso.png");

  let imgIso, imgLna, imgErmIso;
  if (fs.existsSync(logoIsoPath)) {
    const bytes = fs.readFileSync(logoIsoPath);
    const compressed = await sharp(bytes)
      .resize({ width: 300 })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
    imgIso = await pdfDoc.embedPng(compressed);
  }
  if (fs.existsSync(logoLnaPath)) {
    const bytes = fs.readFileSync(logoLnaPath);
    const compressed = await sharp(bytes)
      .resize({ width: 300 })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
    imgLna = await pdfDoc.embedPng(compressed);
  }
  if (fs.existsSync(logoErmIsoPath)) {
    const bytes = fs.readFileSync(logoErmIsoPath);
    const compressed = await sharp(bytes)
      .resize({ width: 300 })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
    imgErmIso = await pdfDoc.embedPng(compressed);
  }

  // Draw top row logos (ISO & LNA only)
  const wIso = imgIso ? (LAYOUT.topLogos.height * 1.10) * 2.68 : 0;
  const wLna = imgLna ? (LAYOUT.topLogos.height * 1.10) * 2.02 : 0;

  const spacing = 5;
  const totalRowWidth = wIso + (wIso && wLna ? spacing : 0) + wLna;
  let currentX = (width - totalRowWidth) / 2;

  if (imgIso) {
    page.drawImage(imgIso, { x: currentX - 8, y: LAYOUT.topLogos.y, width: wIso, height: LAYOUT.topLogos.height * 1.10 });
    currentX += wIso + spacing;
  }
  if (imgLna) {
    page.drawImage(imgLna, { x: currentX, y: LAYOUT.topLogos.y, width: wLna, height: LAYOUT.topLogos.height * 1.10 });
  }

  // Helper to format Indonesian Dates
  const formatIndonesianDate = (date: Date): string => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const d = new Date(date);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Title: SERTIFIKAT
  const titleText = "SERTIFIKAT";
  const titleWidth = fontCinzelBold.widthOfTextAtSize(titleText, LAYOUT.title.fontSize);
  page.drawText(titleText, {
    x: (width - titleWidth) / 2,
    y: LAYOUT.title.y,
    size: LAYOUT.title.fontSize,
    font: fontCinzelBold,
    color: colorNavy,
  });

  // Recipient Institution Name: BANK BPD BALI
  const instName = data.institutionName;
  const instWidth = fontCinzelBold.widthOfTextAtSize(instName, LAYOUT.institution.fontSize);
  page.drawText(instName, {
    x: (width - instWidth) / 2,
    y: LAYOUT.institution.y,
    size: LAYOUT.institution.fontSize,
    font: fontCinzelBold,
    color: colorNavy,
  });

  // Statement: Program Sertifikasi
  const stmtText = data.programName;
  const stmtWidth = fontCinzelBold.widthOfTextAtSize(stmtText, LAYOUT.statement.fontSize);
  page.drawText(stmtText, {
    x: (width - stmtWidth) / 2,
    y: LAYOUT.statement.startY,
    size: LAYOUT.statement.fontSize,
    font: fontCinzelBold,
    color: colorBlack,
  });

  // Description / Ruang Lingkup
  const issuedFormatted = formatIndonesianDate(data.issuedDate);
  const descText = data.description;
  const descWidth = fontCinzelBold.widthOfTextAtSize(descText, LAYOUT.validity.fontSize);
  page.drawText(descText, {
    x: (width - descWidth) / 2,
    y: LAYOUT.validity.startY,
    size: LAYOUT.validity.fontSize,
    font: fontCinzelBold,
    color: colorNavy,
  });

  // Place & date signature block
  const placeText = issuedFormatted;
  const placeWidth = fontCinzelBold.widthOfTextAtSize(placeText, LAYOUT.signature.placeFontSize);
  page.drawText(placeText, {
    x: (width - placeWidth) / 2,
    y: LAYOUT.signature.placeY,
    size: LAYOUT.signature.placeFontSize,
    font: fontCinzelBold,
    color: colorBlack,
  });

  const setByText = "Ditetapkan Oleh:";
  const setByWidth = fontCinzelBold.widthOfTextAtSize(setByText, LAYOUT.signature.setByFontSize);
  page.drawText(setByText, {
    x: LAYOUT.signature.columnCenter - (setByWidth / 2),
    y: LAYOUT.signature.setByY,
    size: LAYOUT.signature.setByFontSize,
    font: fontCinzelBold,
    color: colorBlack,
  });

  const companyText = "PT. Leadership Nasional Asia";
  const companyWidth = fontCinzelBold.widthOfTextAtSize(companyText, LAYOUT.signature.companyFontSize);
  page.drawText(companyText, {
    x: LAYOUT.signature.columnCenter - (companyWidth / 2),
    y: LAYOUT.signature.companyY,
    size: LAYOUT.signature.companyFontSize,
    font: fontCinzelBold,
    color: colorBlack,
  });

  // Left side column: Gold Badge (logo-erm-iso.png)
  if (imgErmIso) {
    const badgeHeight = LAYOUT.goldBadge.height;
    const badgeWidth = badgeHeight * LAYOUT.goldBadge.aspectRatio; 
    page.drawImage(imgErmIso, {
      x: LAYOUT.goldBadge.xAnchor - badgeWidth - LAYOUT.goldBadge.xOffset,
      y: LAYOUT.goldBadge.y,
      width: badgeWidth,
      height: badgeHeight,
    });
  }

  // Right side column: QR Code
  const qrImage = await pdfDoc.embedPng(qrBuffer);
  const qrX = LAYOUT.signature.columnCenter - (LAYOUT.qrCode.size / 2);
  page.drawImage(qrImage, {
    x: qrX,
    y: LAYOUT.qrCode.y,
    width: LAYOUT.qrCode.size,
    height: LAYOUT.qrCode.size,
  });

  // Footer links & cert code (Dinaikkan ke y: 52 agar di atas garis border)
  const footerText = `Certificate No.: ${data.certCode}           www.leadershipnasionalasia.com`;
  const footerWidth = fontHelvetica.widthOfTextAtSize(footerText, LAYOUT.footer.fontSize);

  page.drawText(footerText, {
    x: (width - footerWidth) / 2,
    y: LAYOUT.footer.y,
    size: LAYOUT.footer.fontSize,
    font: fontHelvetica,
    color: colorSlate,
  });

  // 7. Save PDF to file system under uploads/certificates
  const dirPath = path.join(process.cwd(), "public", "uploads", "certificates");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Safe filename replacing / with -
  const filename = `${data.certCode.replace(/\//g, "-")}.pdf`;
  const pdfFilePath = path.join(dirPath, filename);
  
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(pdfFilePath, pdfBytes);

  // Return the public web path to the PDF (e.g. /uploads/certificates/filename)
  const relativeWebPath = `/uploads/certificates/${filename}`;

  return {
    pdfPath: relativeWebPath,
    qrCodeDataUrl,
  };
}
