import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { CertificationCheckpoint } from "@/types/certification-holder";

type Params = { id: string };

const CHECKPOINT_FIELD: Record<CertificationCheckpoint, "refreshment1CompletedAt" | "refreshment2CompletedAt" | "recertCompletedAt"> = {
  refreshment1: "refreshment1CompletedAt",
  refreshment2: "refreshment2CompletedAt",
  recert: "recertCompletedAt",
};

const REMINDER_SENT_FIELD: Record<CertificationCheckpoint, "refreshment1ReminderSentAt" | "refreshment2ReminderSentAt" | "recertReminderSentAt"> = {
  refreshment1: "refreshment1ReminderSentAt",
  refreshment2: "refreshment2ReminderSentAt",
  recert: "recertReminderSentAt",
};

// POST tandai/batalkan satu checkpoint sebagai selesai — admin only.
// Nandai selesai (completed=true) TIDAK menyentuh *ReminderSentAt: itu cuma
// menghentikan reminder BERIKUTNYA (lewat guard completedAt di eligibility
// check), bukan "membatalkan" email yang sudah terlanjur terkirim.
// Batalin tanda selesai (completed=false) BEDA -- itu berarti checkpoint-nya
// ternyata belum kelar, jadi *ReminderSentAt-nya ikut direset supaya window
// H-30 kebuka lagi kalau masih relevan (misal admin salah pencet).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const { checkpoint, completed } = body as { checkpoint?: string; completed?: boolean };

    if (!checkpoint || !(checkpoint in CHECKPOINT_FIELD)) {
      return NextResponse.json(
        { error: "Checkpoint tidak valid" },
        { status: 400 }
      );
    }
    if (typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "Field completed wajib berupa boolean" },
        { status: 400 }
      );
    }

    const field = CHECKPOINT_FIELD[checkpoint as CertificationCheckpoint];
    const reminderSentField = REMINDER_SENT_FIELD[checkpoint as CertificationCheckpoint];
    const updated = await prisma.certificationHolder.update({
      where: { id },
      data: {
        [field]: completed ? new Date() : null,
        ...(completed ? {} : { [reminderSentField]: null }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }
    console.error("Error updating checkpoint completion:", error);
    return NextResponse.json(
      { error: "Failed to update checkpoint completion" },
      { status: 500 }
    );
  }
}
