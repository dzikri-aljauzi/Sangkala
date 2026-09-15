import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { generateTrainingQrCode } from "@/lib/training-qr";

type Params = {
  id: string;
};

// POST buat ulang QR code satu pelatihan — admin/super admin, dengan ownership
// check yang sama seperti PUT/DELETE di [id]/route.ts. Dipisah dari PUT karena
// PUT itu buat field bisnis yang di-edit; QR bukan field bisnis, cuma artifact
// turunan dari id yang tidak pernah berubah. Tidak ada audit log entry -- alasan
// sama seperti generate saat create, ini bukan data bisnis baru.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    const existing = await prisma.training.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Training not found" }, { status: 404 });
    }

    if (session.user.role !== "SUPER_ADMIN" && existing.createdById !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: Anda hanya dapat mengubah pelatihan yang Anda buat sendiri" },
        { status: 403 }
      );
    }

    const qrCodeData = await generateTrainingQrCode(id);
    const updated = await prisma.training.update({
      where: { id },
      data: { qrCodeData },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error regenerating training QR code:", error);
    return NextResponse.json(
      { error: "Failed to regenerate QR code" },
      { status: 500 }
    );
  }
}
