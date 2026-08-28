import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type Params = { id: string };

// PUT edit satu pemegang sertifikasi — admin only
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const {
      bsmrId,
      name,
      institution,
      level,
      certificationName,
      email,
      examDate,
      expiryDate,
      refreshment1Date,
      refreshment2Date,
    } = body;

    if (!bsmrId || !name || !institution || !level || !certificationName || !email || !examDate || !expiryDate || !refreshment1Date || !refreshment2Date) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const existing = await prisma.certificationHolder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    const newExpiryDate = new Date(expiryDate);
    const newRefreshment1Date = new Date(refreshment1Date);
    const newRefreshment2Date = new Date(refreshment2Date);

    // Sama kayak import/route.ts: kalau tanggal checkpoint beneran berubah,
    // *ReminderSentAt DAN *CompletedAt checkpoint terkait direset -- supaya
    // window H-30 kebuka baru dan status/reminder nggak nyangkut ke
    // completedAt siklus lama begitu holder mulai siklus baru.
    const expiryChanged = existing.expiryDate.getTime() !== newExpiryDate.getTime();
    const refreshment1Changed = existing.refreshment1Date.getTime() !== newRefreshment1Date.getTime();
    const refreshment2Changed = existing.refreshment2Date.getTime() !== newRefreshment2Date.getTime();

    const updated = await prisma.certificationHolder.update({
      where: { id },
      data: {
        bsmrId,
        name,
        institution,
        level,
        certificationName,
        email,
        examDate: new Date(examDate),
        expiryDate: newExpiryDate,
        refreshment1Date: newRefreshment1Date,
        refreshment2Date: newRefreshment2Date,
        recertReminderSentAt: expiryChanged ? null : undefined,
        refreshment1ReminderSentAt: refreshment1Changed ? null : undefined,
        refreshment2ReminderSentAt: refreshment2Changed ? null : undefined,
        recertCompletedAt: expiryChanged ? null : undefined,
        refreshment1CompletedAt: refreshment1Changed ? null : undefined,
        refreshment2CompletedAt: refreshment2Changed ? null : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "ID BSMR sudah terdaftar" }, { status: 400 });
    }
    console.error("Error updating certification holder:", error);
    return NextResponse.json(
      { error: "Failed to update certification holder" },
      { status: 500 }
    );
  }
}

// DELETE hapus satu pemegang sertifikasi — admin only
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await prisma.certificationHolder.delete({ where: { id } });

    return NextResponse.json({ message: "Berhasil dihapus" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }
    console.error("Error deleting certification holder:", error);
    return NextResponse.json(
      { error: "Failed to delete certification holder" },
      { status: 500 }
    );
  }
}
