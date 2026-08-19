import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// GET echelons by assessment
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
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

    const echelons = await prisma.echelon.findMany({
      where: { assessmentId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(echelons);
  } catch (error) {
    console.error("Error fetching echelons:", error);
    return NextResponse.json(
      { error: "Failed to fetch echelons" },
      { status: 500 }
    );
  }
}

// POST create new echelon (Admin only)
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const data = await request.json();
    const { name, assessmentId, order } = data;

    if (!name || !assessmentId) {
      return NextResponse.json(
        { error: "Name and Assessment ID are required" },
        { status: 400 }
      );
    }

    // Get next order if not provided
    let nextOrder = order;
    if (nextOrder === undefined) {
      const lastEchelon = await prisma.echelon.findFirst({
        where: { assessmentId },
        orderBy: { order: "desc" },
      });
      nextOrder = lastEchelon ? lastEchelon.order + 1 : 0;
    }

    const echelon = await prisma.echelon.create({
      data: {
        name,
        assessmentId,
        order: nextOrder,
      },
    });

    return NextResponse.json(echelon, { status: 201 });
  } catch (error) {
    console.error("Error creating echelon:", error);
    return NextResponse.json(
      { error: "Failed to create echelon" },
      { status: 500 }
    );
  }
}
