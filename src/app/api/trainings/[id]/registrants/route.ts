import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendAdminNotification } from "@/lib/email";

type Params = {
  id: string;
};

// GET daftar pendaftar untuk satu pelatihan — admin only
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const training = await prisma.training.findUnique({ where: { id } });
    if (!training) {
      return NextResponse.json({ error: "Training not found" }, { status: 404 });
    }

    const registrants = await prisma.trainingRegistrant.findMany({
      where: { trainingId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(registrants);
  } catch (error) {
    console.error("Error fetching registrants:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrants" },
      { status: 500 }
    );
  }
}

// POST pendaftaran peserta baru — publik
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;

    const training = await prisma.training.findUnique({ where: { id } });
    if (!training || !training.isActive) {
      return NextResponse.json(
        { error: "Training not found or inactive" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, email, phone, institution, paymentProofPath } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    if (
      training.requiresPayment &&
      (typeof paymentProofPath !== "string" || !paymentProofPath.trim())
    ) {
      return NextResponse.json(
        { error: "Bukti pembayaran wajib diunggah" },
        { status: 400 }
      );
    }

    if (typeof training.capacity === "number") {
      const activeCount = await prisma.trainingRegistrant.count({
        where: { trainingId: id, paymentStatus: { not: "REJECTED" } },
      });
      if (activeCount >= training.capacity) {
        return NextResponse.json(
          { error: "Kuota pendaftar sudah penuh" },
          { status: 400 }
        );
      }
    }

    const registrant = await prisma.trainingRegistrant.create({
      data: {
        trainingId: id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        institution:
          typeof institution === "string" && institution.trim()
            ? institution.trim()
            : null,
        paymentProofPath: training.requiresPayment ? paymentProofPath.trim() : null,
        paymentStatus: training.requiresPayment ? "PENDING" : "NOT_REQUIRED",
      },
    });

    // Send email notification to admin (non-blocking)
    sendAdminNotification({
      trainingTitle: training.title,
      name: registrant.name,
      email: registrant.email,
      phone: registrant.phone,
      institution: registrant.institution,
    }).catch((err) => {
      console.error("Non-blocking email notification error:", err);
    });

    return NextResponse.json(registrant, { status: 201 });
  } catch (error) {
    console.error("Error creating registrant:", error);
    return NextResponse.json(
      { error: "Failed to register for training" },
      { status: 500 }
    );
  }
}
