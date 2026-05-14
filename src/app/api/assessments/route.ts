import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
