import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { recordAuditLog, computeChangesDiff } from "@/lib/audit";

type Params = {
  id: string;
};

// GET detail pelatihan — publik untuk yang isActive, admin/super admin bisa lihat yang nonaktif juga
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;

    const training = await prisma.training.findUnique({
      where: { id },
      include: {
        _count: { select: { registrants: true } },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!training) {
      return NextResponse.json({ error: "Training not found" }, { status: 404 });
    }

    if (!training.isActive) {
      const session = await getServerSession(authOptions);
      if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
        return NextResponse.json({ error: "Training not found" }, { status: 404 });
      }
    }

    // Registrant REJECTED tidak menghitung kuota — dihitung terpisah dari _count.registrants
    // (yang total semua status) supaya halaman publik bisa tampilkan sisa kuota yang akurat.
    const activeRegistrantsCount = await prisma.trainingRegistrant.count({
      where: { trainingId: id, paymentStatus: { not: "REJECTED" } },
    });

    return NextResponse.json({ ...training, activeRegistrantsCount });
  } catch (error) {
    console.error("Error fetching training:", error);
    return NextResponse.json(
      { error: "Failed to fetch training" },
      { status: 500 }
    );
  }
}

// PUT update pelatihan — admin / super admin
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const { title, location, startDate, endDate, price, description, imagePath, isActive, requiresPayment, capacity } = body;

    const existing = await prisma.training.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Training not found" }, { status: 404 });
    }

    // Otorisasi: SUPER_ADMIN dapat mengubah semua pelatihan; ADMIN hanya pelatihan yang dibuat sendiri
    if (session.user.role !== "SUPER_ADMIN" && existing.createdById !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: Anda hanya dapat mengubah pelatihan yang Anda buat sendiri" },
        { status: 403 }
      );
    }

    // Kasus khusus: jika hanya toggle isActive (quick status change)
    const isOnlyStatusToggle =
      typeof isActive === "boolean" &&
      !title &&
      !location &&
      !startDate &&
      !description;

    if (!isOnlyStatusToggle) {
      if (!title || !location || !startDate || !endDate || !description) {
        return NextResponse.json(
          { error: "Judul, tempat, tanggal mulai, tanggal selesai, dan deskripsi wajib diisi" },
          { status: 400 }
        );
      }
    }

    const nextData = {
      title: title || existing.title,
      location: location || existing.location,
      startDate: startDate ? new Date(startDate) : existing.startDate,
      endDate: endDate === undefined ? existing.endDate : (endDate ? new Date(endDate) : null),
      price: price === undefined ? existing.price : (price || null),
      description: description || existing.description,
      imagePath: imagePath === undefined ? existing.imagePath : (imagePath || null),
      isActive: typeof isActive === "boolean" ? isActive : existing.isActive,
      requiresPayment: typeof requiresPayment === "boolean" ? requiresPayment : existing.requiresPayment,
      capacity: capacity === undefined ? existing.capacity : (typeof capacity === "number" ? capacity : null),
    };

    const changes = computeChangesDiff(
      {
        title: existing.title,
        location: existing.location,
        startDate: existing.startDate.toISOString(),
        endDate: existing.endDate ? existing.endDate.toISOString() : null,
        price: existing.price,
        description: existing.description,
        isActive: existing.isActive,
        requiresPayment: existing.requiresPayment,
        capacity: existing.capacity,
      },
      {
        title: nextData.title,
        location: nextData.location,
        startDate: nextData.startDate.toISOString(),
        endDate: nextData.endDate ? nextData.endDate.toISOString() : null,
        price: nextData.price,
        description: nextData.description,
        isActive: nextData.isActive,
        requiresPayment: nextData.requiresPayment,
        capacity: nextData.capacity,
      }
    );

    const updated = await prisma.training.update({
      where: { id },
      data: nextData,
    });

    const isStatusOnly = Object.keys(changes).length === 1 && "isActive" in changes;
    const action = isStatusOnly ? "STATUS_CHANGE" : "UPDATE";
    const summary = isStatusOnly
      ? `${nextData.isActive ? "Mengaktifkan" : "Menonaktifkan"} pelatihan "${updated.title}"`
      : `Mengubah data pelatihan "${updated.title}"`;

    await recordAuditLog({
      entityType: "TRAINING",
      entityId: updated.id,
      action,
      summary,
      changes,
      userId: session.user.id,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating training:", error);
    return NextResponse.json(
      { error: "Failed to update training" },
      { status: 500 }
    );
  }
}

// DELETE hapus pelatihan — super admin atau pemilik pelatihan
export async function DELETE(
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
        { error: "Forbidden: Anda hanya dapat menghapus pelatihan yang Anda buat sendiri" },
        { status: 403 }
      );
    }

    await prisma.training.delete({ where: { id } });

    await recordAuditLog({
      entityType: "TRAINING",
      entityId: id,
      action: "DELETE",
      summary: `Menghapus pelatihan "${existing.title}"`,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true, message: "Pelatihan berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting training:", error);
    return NextResponse.json(
      { error: "Failed to delete training" },
      { status: 500 }
    );
  }
}
