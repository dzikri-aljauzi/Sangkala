import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch all progress for an assessment
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("assessmentId");

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      );
    }

    // Check access - ADMIN/SUPER_ADMIN can access any, others only their assigned assessment
    const role = session.user.role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      if (session.user.assessmentId !== assessmentId) {
        return NextResponse.json(
          { error: "Access denied to this assessment" },
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

    const progresses = await prisma.progress.findMany({
      where: { assessmentId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(progresses);
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

// POST - Create new progress (ADMIN/SUPER_ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only admin can create progress" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { activityName, percentage, description, order, assessmentId } = body;

    if (!activityName || !assessmentId) {
      return NextResponse.json(
        { error: "Activity name and assessment ID are required" },
        { status: 400 }
      );
    }

    // Validate percentage
    const percentValue = parseInt(percentage) || 0;
    if (percentValue < 0 || percentValue > 100) {
      return NextResponse.json(
        { error: "Percentage must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Verify assessment exists
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Get max order if not provided
    let orderValue = order;
    if (orderValue === undefined || orderValue === null) {
      const maxOrder = await prisma.progress.findFirst({
        where: { assessmentId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      orderValue = (maxOrder?.order ?? -1) + 1;
    }

    const progress = await prisma.progress.create({
      data: {
        activityName,
        percentage: percentValue,
        description: description || null,
        order: orderValue,
        assessmentId,
      },
    });

    return NextResponse.json(progress, { status: 201 });
  } catch (error) {
    console.error("Error creating progress:", error);
    return NextResponse.json(
      { error: "Failed to create progress" },
      { status: 500 }
    );
  }
}
