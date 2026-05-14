import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET single echelon
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const echelon = await prisma.echelon.findUnique({
      where: { id },
      include: {
        _count: {
          select: { resumes: true },
        },
      },
    });

    if (!echelon) {
      return NextResponse.json({ error: "Echelon not found" }, { status: 404 });
    }

    return NextResponse.json(echelon);
  } catch (error) {
    console.error("Error fetching echelon:", error);
    return NextResponse.json(
      { error: "Failed to fetch echelon" },
      { status: 500 }
    );
  }
}

// PUT update echelon (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    const { name, order } = data;

    const echelon = await prisma.echelon.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json(echelon);
  } catch (error) {
    console.error("Error updating echelon:", error);
    return NextResponse.json(
      { error: "Failed to update echelon" },
      { status: 500 }
    );
  }
}

// DELETE echelon (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if echelon has resumes
    const echelon = await prisma.echelon.findUnique({
      where: { id },
      include: {
        _count: {
          select: { resumes: true },
        },
      },
    });

    if (!echelon) {
      return NextResponse.json({ error: "Echelon not found" }, { status: 404 });
    }

    // Delete echelon (resumes will have echelonId set to null due to onDelete: SetNull)
    await prisma.echelon.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Echelon deleted successfully" });
  } catch (error) {
    console.error("Error deleting echelon:", error);
    return NextResponse.json(
      { error: "Failed to delete echelon" },
      { status: 500 }
    );
  }
}
