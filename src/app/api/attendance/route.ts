import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// GET - Fetch attendances for an assessment
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

    // Check access based on role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Admin and Asesor can access all, Klien and Staff_Klien only their own assessment
    if (
      user.role !== "ADMIN" &&
      user.role !== "ASESOR" &&
      user.assessmentId !== assessmentId
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const attendances = await prisma.attendance.findMany({
      where: { assessmentId },
      include: {
        uploadedBy: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error("Error fetching attendances:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendances" },
      { status: 500 }
    );
  }
}

// POST - Upload new attendance (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can upload attendance
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const assessmentId = formData.get("assessmentId") as string;

    if (!file || !title || !assessmentId) {
      return NextResponse.json(
        { error: "File, title, and assessmentId are required" },
        { status: 400 }
      );
    }

    // Validate file type (PDF or Word)
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF and Word documents are allowed" },
        { status: 400 }
      );
    }

    // Create upload directory (use "public/uploads" to match download handler)
    const uploadDir = join(process.cwd(), "public", "uploads", "attendances", assessmentId);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split(".").pop();
    const uniqueFileName = `${timestamp}-${randomStr}.${ext}`;
    const filePath = join(uploadDir, uniqueFileName);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save to database (store relative path without "public" prefix)
    const dbFilePath = `/uploads/attendances/${assessmentId}/${uniqueFileName}`;
    const attendance = await prisma.attendance.create({
      data: {
        title,
        fileName: file.name,
        filePath: dbFilePath,
        assessmentId,
        uploadedById: session.user.id,
      },
      include: {
        uploadedBy: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error: any) {
    console.error("Error uploading attendance:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to upload attendance", details: error?.message },
      { status: 500 }
    );
  }
}
