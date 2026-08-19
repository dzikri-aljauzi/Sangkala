import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { generateCertificatePdf } from "@/lib/pdf-generator";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";
    const type = searchParams.get("type") || "";

    const whereClause: Prisma.CertificateWhereInput = {};

    if (search) {
      whereClause.OR = [
        { certCode: { contains: search } },
        { recipientName: { contains: search } },
        { programName: { contains: search } },
      ];
    }

    if (type) {
      whereClause.type = type;
    }

    const certificates = await prisma.certificate.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    // Verify session user still exists in DB (handles DB resets)
    const sessionUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Sesi Anda sudah tidak valid. Silakan logout dan login kembali." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      certCode,
      type = "INSTANSI",
      recipientName,
      programName,
      description,
      issuedDate,
      participants = [],
    } = body;

    // Validation
    if (!certCode || !recipientName || !programName || !description || !issuedDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check unique certificate code
    const existing = await prisma.certificate.findUnique({
      where: { certCode },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Certificate code already exists" },
        { status: 409 }
      );
    }

    // Generate secure URL hash
    const verifyHash = crypto.randomBytes(16).toString("hex");

    const issuedDateObj = new Date(issuedDate);

    // Call PDF generation logic
    let pdfPath = "";
    let qrCodeDataUrl = "";
    try {
      const result = await generateCertificatePdf({
        certCode,
        institutionName: recipientName,
        programName,
        description,
        issuedDate: issuedDateObj,
        verifyHash,
      });
      pdfPath = result.pdfPath;
      qrCodeDataUrl = result.qrCodeDataUrl;
    } catch (pdfError) {
      console.error("Error generating certificate PDF:", pdfError);
      return NextResponse.json(
        {
          error: `Gagal menghasilkan PDF: ${
            pdfError instanceof Error ? pdfError.message : "Unknown error"
          }`,
        },
        { status: 500 }
      );
    }

    // Save in DB
    try {
      const certificate = await prisma.certificate.create({
        data: {
          certCode,
          type,
          verifyHash,
          recipientName,
          programName,
          description,
          maturityLevel: null,
          issuedDate: issuedDateObj,
          qrCodeData: qrCodeDataUrl,
          pdfPath: pdfPath,
          createdById: session.user.id,
          participants: {
            create:
              type === "INSTANSI"
                ? participants.map((name: string) => ({ name }))
                : [],
          },
        },
        include: {
          participants: true,
        },
      });

      return NextResponse.json(certificate, { status: 201 });
    } catch (dbError) {
      console.error("Database error creating certificate:", dbError);
      const errorMessage =
        dbError instanceof Prisma.PrismaClientKnownRequestError
          ? `Database error: ${dbError.message}`
          : dbError instanceof Error
            ? dbError.message
            : "Failed to create certificate";
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error) {
    console.error("Error creating certificate:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create certificate" },
      { status: 500 }
    );
  }
}
