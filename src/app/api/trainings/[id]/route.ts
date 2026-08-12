import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  id: string;
};

// GET detail pelatihan — publik untuk yang isActive, admin bisa lihat yang nonaktif juga
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
      },
    });

    if (!training) {
      return NextResponse.json({ error: "Training not found" }, { status: 404 });
    }

    if (!training.isActive) {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Training not found" }, { status: 404 });
      }
    }

    return NextResponse.json(training);
  } catch (error) {
    console.error("Error fetching training:", error);
    return NextResponse.json(
      { error: "Failed to fetch training" },
      { status: 500 }
    );
  }
}

// PUT update pelatihan — admin only
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
    const { title, location, startDate, price, description, imagePath, isActive } = body;

    if (!title || !location || !startDate || !description) {
      return NextResponse.json(
        { error: "Judul, tempat, tanggal, dan deskripsi wajib diisi" },
        { status: 400 }
      );
    }

    const existing = await prisma.training.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Training not found" }, { status: 404 });
    }

    const updated = await prisma.training.update({
      where: { id },
      data: {
        title,
        location,
        startDate: new Date(startDate),
        price: price || null,
        description,
        imagePath: imagePath || null,
        isActive: typeof isActive === "boolean" ? isActive : existing.isActive,
      },
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
