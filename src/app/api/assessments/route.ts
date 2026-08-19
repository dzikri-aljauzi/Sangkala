import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// GET all assessments
export async function GET() {
  try {
    const assessments = await prisma.assessment.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            users: true,
            documents: true,
            resumes: true,
            documentations: true,
          },
        },
      },
    });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}

// POST create new assessment (Admin only)
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const data = await request.json();
    const { name, description, clientName, clientLogo } = data;

    if (!name || !clientName) {
      return NextResponse.json(
        { error: "Name and client name are required" },
        { status: 400 }
      );
    }

    const assessment = await prisma.assessment.create({
      data: {
        name,
        description,
        clientName,
        clientLogo,
      },
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { error: "Failed to create assessment" },
      { status: 500 }
    );
  }
}
