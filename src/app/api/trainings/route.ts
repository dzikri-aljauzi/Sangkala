import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getTrainingDateRange, isTrainingDateFilter } from "@/lib/training-filters";
import { recordAuditLog } from "@/lib/audit";
import { generateTrainingQrCode } from "@/lib/training-qr";

// GET list pelatihan — publik (hanya isActive), admin bisa lihat semua lewat ?includeInactive=true
// Query param opsional: ?search=judul & ?filter=minggu-ini|bulan-ini|tahun-ini (berdasarkan startDate)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const includeInactive = searchParams.get("includeInactive") === "true";
    const filter = searchParams.get("filter") || "";

    let allowInactive = false;
    if (includeInactive) {
      const session = await getServerSession(authOptions);
      allowInactive = !!session && (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN");
    }

    const whereClause: Prisma.TrainingWhereInput = {};
    if (!allowInactive) {
      whereClause.isActive = true;
    }
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { location: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (isTrainingDateFilter(filter)) {
      const { start, end } = getTrainingDateRange(filter);
      whereClause.startDate = { gte: start, lte: end };
    }

    const trainings = await prisma.training.findMany({
      where: whereClause,
      orderBy: { startDate: "asc" },
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

    return NextResponse.json(trainings);
  } catch (error) {
    console.error("Error fetching trainings:", error);
    return NextResponse.json(
      { error: "Failed to fetch trainings" },
      { status: 500 }
    );
  }
}

// POST create pelatihan baru — admin / super admin only
export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const { title, location, startDate, endDate, price, description, imagePath, requiresPayment, capacity } = body;

    if (!title || !location || !startDate || !endDate || !description) {
      return NextResponse.json(
        { error: "Judul, tempat, tanggal mulai, tanggal selesai, dan deskripsi wajib diisi" },
        { status: 400 }
      );
    }

    const training = await prisma.training.create({
      data: {
        title,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        price: price || null,
        description,
        imagePath: imagePath || null,
        requiresPayment: typeof requiresPayment === "boolean" ? requiresPayment : false,
        capacity: typeof capacity === "number" ? capacity : null,
        createdById: session.user.id,
      },
    });

    // QR code cuma turunan dari training.id (yang tidak pernah berubah) --
    // gagal generate di sini TIDAK boleh menggagalkan pembuatan pelatihan,
    // qrCodeData tetap null dan bisa di-generate ulang kapan saja (backfill
    // script atau tombol regenerate di admin).
    try {
      const qrCodeData = await generateTrainingQrCode(training.id);
      await prisma.training.update({
        where: { id: training.id },
        data: { qrCodeData },
      });
      training.qrCodeData = qrCodeData;
    } catch (qrError) {
      console.error("Error generating training QR code:", qrError);
    }

    // Catat riwayat pembuatan di AuditLog
    await recordAuditLog({
      entityType: "TRAINING",
      entityId: training.id,
      action: "CREATE",
      summary: `Membuat pelatihan "${training.title}"`,
      userId: session.user.id,
    });

    return NextResponse.json(training, { status: 201 });
  } catch (error) {
    console.error("Error creating training:", error);
    return NextResponse.json(
      { error: "Failed to create training" },
      { status: 500 }
    );
  }
}
