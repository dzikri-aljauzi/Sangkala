import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch single progress by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const progress = await prisma.progress.findUnique({
      where: { id },
      include: { assessment: true },
    });

    if (!progress) {
      return NextResponse.json(
        { error: "Progress not found" },
        { status: 404 }
      );
    }

    // Check access
    const role = session.user.role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      if (session.user.assessmentId !== progress.assessmentId) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }
    }

    // ASESOR cannot view progress
    if (role === "ASESOR") {
      return NextResponse.json(
        { error: "Asesor tidak memiliki akses ke progress" },
        { status: 403 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

// PUT - Update progress (ADMIN/SUPER_ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only admin can update progress" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { activityName, percentage, description, order } = body;

    // Check if progress exists
    const existingProgress = await prisma.progress.findUnique({
      where: { id },
    });

    if (!existingProgress) {
      return NextResponse.json(
        { error: "Progress not found" },
        { status: 404 }
      );
    }

    // Validate percentage if provided
    if (percentage !== undefined) {
      const percentValue = parseInt(percentage);
      if (percentValue < 0 || percentValue > 100) {
        return NextResponse.json(
          { error: "Percentage must be between 0 and 100" },
          { status: 400 }
        );
      }
    }

    const updatedProgress = await prisma.progress.update({
      where: { id },
      data: {
        ...(activityName && { activityName }),
        ...(percentage !== undefined && { percentage: parseInt(percentage) }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json(updatedProgress);
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}

// DELETE - Delete progress (ADMIN/SUPER_ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only admin can delete progress" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if progress exists
    const existingProgress = await prisma.progress.findUnique({
      where: { id },
    });

    if (!existingProgress) {
      return NextResponse.json(
        { error: "Progress not found" },
        { status: 404 }
      );
    }

    await prisma.progress.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Progress deleted successfully" });
  } catch (error) {
    console.error("Error deleting progress:", error);
    return NextResponse.json(
      { error: "Failed to delete progress" },
      { status: 500 }
    );
  }
}
