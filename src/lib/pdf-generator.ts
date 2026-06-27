import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
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
  // 1. Logo Baris Atas (LNA)
  topLogos: {
    y: 465,
    height: 90,
    rightMargin: 75,
  },
  
  // 2. Judul Sertifikat
  title: {
    y: 465,
    fontSize: 40,
  },

  // 2b. Nomor Sertifikat
  certNo: {
    y: 445,
    fontSize: 14,
  },

  // 2c. Teks "diberikan kepada"
  givenTo: {
    y: 425,
    fontSize: 14,
  },

  // 3. Nama Lembaga / Instansi Penerima
  institution: {
    y: 375,
    fontSize: 39.9,
  },

  // 4. Teks Pernyataan (Program Sertifikasi)
  statement: {
    startY: 330,
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
    columnCenter: 545,
  },



  // 8. QR Code Verifikasi
  qrCode: {
    y: 90,
    size: 72,
  },

  // 9. Catatan Kaki (Footer)
  footer: {
    y: 52,
    fontSize: 10,
  }
};

// Helper function to wrap text within a maximum width boundary
function wrapText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

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
  const colorGold = rgb(145 / 255, 114 / 255, 36 / 255); // gold

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
  const logoLnaPath = path.join(process.cwd(), "public", "certificate-assets", "templates", "logo-lna.png");

  let imgLna;
  if (fs.existsSync(logoLnaPath)) {
    const bytes = fs.readFileSync(logoLnaPath);
    const compressed = await sharp(bytes)
      .resize({ width: 300 })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
    imgLna = await pdfDoc.embedPng(compressed);
  }

  // Draw top row logo (LNA only)
  const wLna = imgLna ? (LAYOUT.topLogos.height * 1.10) * 2.02 : 0;
  const currentX = width - LAYOUT.topLogos.rightMargin - wLna;

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
    color: colorBlack,
  });

  // Certificate Number: No. Sertifikat
  const certNoText = `No. Sertifikat : ${data.certCode}`;
  const certNoWidth = fontHelvetica.widthOfTextAtSize(certNoText, LAYOUT.certNo.fontSize);
  page.drawText(certNoText, {
    x: (width - certNoWidth) / 2,
    y: LAYOUT.certNo.y,
    size: LAYOUT.certNo.fontSize,
    font: fontHelvetica,
    color: colorNavy,
  });

  // Given To Text: diberikan kepada
  const givenToText = "Diberikan Kepada";
  const givenToWidth = fontHelveticaBold.widthOfTextAtSize(givenToText, LAYOUT.givenTo.fontSize);
  page.drawText(givenToText, {
    x: (width - givenToWidth) / 2,
    y: LAYOUT.givenTo.y,
    size: LAYOUT.givenTo.fontSize,
    font: fontHelvetica,
    color: colorNavy,
  });

  // Recipient Institution / Individual Name
  const instName = data.institutionName;
  const instWidth = fontCinzelBold.widthOfTextAtSize(instName, LAYOUT.institution.fontSize);
  page.drawText(instName, {
    x: (width - instWidth) / 2,
    y: LAYOUT.institution.y,
    size: LAYOUT.institution.fontSize,
    font: fontCinzelBold,
    color: colorNavy,
  });

  // Statement: Program Sertifikasi (Wrapped to fit width bounds)
  const maxStmtWidth = 650;
  const stmtLines = wrapText(data.programName, maxStmtWidth, fontCinzelBold, LAYOUT.statement.fontSize);
  const lineSpacing = LAYOUT.statement.fontSize * 1.4;
  const startY = LAYOUT.statement.startY + ((stmtLines.length - 1) * lineSpacing) / 2;

  for (let i = 0; i < stmtLines.length; i++) {
    const lineText = stmtLines[i];
    const lineWidth = fontCinzelBold.widthOfTextAtSize(lineText, LAYOUT.statement.fontSize);
    page.drawText(lineText, {
      x: (width - lineWidth) / 2,
      y: startY - (i * lineSpacing),
      size: LAYOUT.statement.fontSize,
      font: fontCinzelBold,
      color: colorGold,
    });
  }

  // Description / Ruang Lingkup
  const issuedFormatted = formatIndonesianDate(data.issuedDate);
  const descText = data.description;
  const maxDescWidth = 700;
  const descLines = wrapText(descText, maxDescWidth, fontCinzelBold, LAYOUT.validity.fontSize);
  const descLineSpacing = LAYOUT.validity.fontSize * 1.4;
  const descStartY = LAYOUT.validity.startY + ((descLines.length - 1) * descLineSpacing) / 2;

  for (let i = 0; i < descLines.length; i++) {
    const lineText = descLines[i];
    const lineWidth = fontCinzelBold.widthOfTextAtSize(lineText, LAYOUT.validity.fontSize);
    page.drawText(lineText, {
      x: (width - lineWidth) / 2,
      y: descStartY - (i * descLineSpacing),
      size: LAYOUT.validity.fontSize,
      font: fontCinzelBold,
      color: colorNavy,
    });
  }

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



  // Right side column: QR Code
  const qrImage = await pdfDoc.embedPng(qrBuffer);
  const qrX = LAYOUT.signature.columnCenter - (LAYOUT.qrCode.size / 2);
  page.drawImage(qrImage, {
    x: qrX,
    y: LAYOUT.qrCode.y,
    width: LAYOUT.qrCode.size,
    height: LAYOUT.qrCode.size,
  });

  // Footer links (Dinaikkan ke y: 52 agar di atas garis border)
  const footerText = "www.leadershipnasionalasia.com";
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

  // Random mixed-case letters + timestamp for unique filename
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const randomPart = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const filename = `${randomPart}-${Date.now()}.pdf`;
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
