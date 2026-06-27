import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCertificatePdf } from "@/lib/pdf-generator";
import fs from "fs";
import path from "path";

type Params = {
  id: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;

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
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    return NextResponse.json(certificate);
  } catch (error) {
    console.error("Error fetching certificate:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificate" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { certCode, recipientName, programName, description, issuedDate } = body;

    if (!certCode || !recipientName || !programName || !description || !issuedDate) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.certificate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // Delete old PDF file from disk
    if (existing.pdfPath) {
      const oldPdfPath = path.join(process.cwd(), "public", existing.pdfPath);
      try {
        if (fs.existsSync(oldPdfPath)) {
          fs.unlinkSync(oldPdfPath);
        }
      } catch (err) {
        console.error("Failed to delete old PDF:", err);
      }
    }

    // Generate new PDF with updated data
    const { pdfPath, qrCodeDataUrl } = await generateCertificatePdf({
      certCode,
      institutionName: recipientName,
      programName,
      description,
      issuedDate: new Date(issuedDate),
      verifyHash: existing.verifyHash,
    });

    // Update DB — sync qrCodeData and keep verifyHash
    const updated = await prisma.certificate.update({
      where: { id },
      data: {
        certCode,
        recipientName,
        programName,
        description,
        issuedDate: new Date(issuedDate),
        pdfPath,
        qrCodeData: qrCodeDataUrl,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating certificate:", error);
    return NextResponse.json(
      { error: "Failed to update certificate" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
    });

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // Try deleting the physical PDF file
    if (certificate.pdfPath) {
      const fullPath = path.join(process.cwd(), "public", certificate.pdfPath);
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        console.error("Failed to delete PDF file:", err);
        // We continue deleting from database even if file system delete fails
      }
    }

    // Delete from DB
    await prisma.certificate.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Certificate deleted successfully" });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    return NextResponse.json(
      { error: "Failed to delete certificate" },
      { status: 500 }
    );
  }
}
