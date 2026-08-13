import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  notifyRegistrantPaymentApproved,
  notifyRegistrantPaymentRejected,
} from "@/lib/email";

type Params = {
  id: string;
  registrantId: string;
};

// PUT approve/reject bukti pembayaran — admin only
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, registrantId } = await params;

    const registrant = await prisma.trainingRegistrant.findUnique({
      where: { id: registrantId },
      include: { training: true },
    });

    if (!registrant || registrant.trainingId !== id) {
      return NextResponse.json({ error: "Registrant not found" }, { status: 404 });
    }

    const body = await request.json();
    const { action, rejectionReason } = body;

    if (action !== "approve" && action !== "reject" && action !== "reset") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (action === "reset") {
      // Batalkan keputusan approve/reject sebelumnya — balik ke Menunggu, tidak kirim email
      // (ini koreksi internal admin, bukan sesuatu yang perlu diketahui peserta).
      const updated = await prisma.trainingRegistrant.update({
        where: { id: registrantId },
        data: {
          paymentStatus: "PENDING",
          rejectionReason: null,
          reviewedAt: null,
          reviewedById: null,
        },
      });
      return NextResponse.json(updated);
    }

    if (action === "reject") {
      const reason = typeof rejectionReason === "string" ? rejectionReason.trim() : "";
      if (!reason) {
        return NextResponse.json(
          { error: "Alasan penolakan wajib diisi" },
          { status: 400 }
        );
      }

      // Sudah ditolak dengan alasan yang sama persis — jangan kirim email duplikat
      // (mis. admin tidak sengaja klik dua kali / submit ulang).
      if (registrant.paymentStatus === "REJECTED" && registrant.rejectionReason === reason) {
        return NextResponse.json(registrant);
      }

      const updated = await prisma.trainingRegistrant.update({
        where: { id: registrantId },
        data: {
          paymentStatus: "REJECTED",
          rejectionReason: reason,
          reviewedAt: new Date(),
          reviewedById: session.user.id,
        },
      });

      notifyRegistrantPaymentRejected({
        to: registrant.email,
        name: registrant.name,
        trainingTitle: registrant.training.title,
        rejectionReason: reason,
      }).catch((err) => {
        console.error("Non-blocking email notification error:", err);
      });

      return NextResponse.json(updated);
    }

    // action === "approve"
    // Sudah disetujui sebelumnya — jangan kirim email duplikat.
    if (registrant.paymentStatus === "APPROVED") {
      return NextResponse.json(registrant);
    }

    const updated = await prisma.trainingRegistrant.update({
      where: { id: registrantId },
      data: {
        paymentStatus: "APPROVED",
        rejectionReason: null,
        reviewedAt: new Date(),
        reviewedById: session.user.id,
      },
    });

    notifyRegistrantPaymentApproved({
      to: registrant.email,
      name: registrant.name,
      trainingTitle: registrant.training.title,
    }).catch((err) => {
      console.error("Non-blocking email notification error:", err);
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error reviewing payment proof:", error);
    return NextResponse.json(
      { error: "Failed to review payment proof" },
      { status: 500 }
    );
  }
}
