import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'document', 'resume', 'documentation', 'logo'
    const assessmentId = formData.get("assessmentId") as string;
    const title = formData.get("title") as string;
    // Resume classification fields
    const category = formData.get("category") as string; // UMUM, ESELON, INDIVIDU
    const echelonId = formData.get("echelonId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!type || !assessmentId) {
      return NextResponse.json(
        { error: "Type and assessment ID are required" },
        { status: 400 }
      );
    }

    // Validate file type based on upload type
    const allowedTypes: Record<string, string[]> = {
      document: [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "application/pdf",
      ],
      resume: [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "application/pdf",
      ],
      documentation: [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ],
      logo: ["image/jpeg", "image/png", "image/jpg", "image/svg+xml"],
    };

    if (!allowedTypes[type]?.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      );
    }

    // Check permissions
    if (type === "document" && session.user.role !== "ASESOR") {
      return NextResponse.json(
        { error: "Only asesor can upload documents" },
        { status: 403 }
      );
    }

    if (
      (type === "resume" || type === "documentation" || type === "logo") &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Only admin can upload this type" },
        { status: 403 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Determine upload directory
    let uploadDir = "";
    switch (type) {
      case "document":
        uploadDir = "documents";
        break;
      case "resume":
        uploadDir = "resumes";
        break;
      case "documentation":
        uploadDir = "documentations";
        break;
      case "logo":
        uploadDir = "logos";
        break;
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file
    const path = join(process.cwd(), "public", "uploads", uploadDir, fileName);
    await writeFile(path, buffer);

    const filePath = `/uploads/${uploadDir}/${fileName}`;

    // Save to database (except for logos)
    if (type !== "logo") {
      let record;
      const baseData = {
        title: title || file.name,
        fileName: file.name,
        filePath,
        assessmentId,
        uploadedById: session.user.id,
      };

      switch (type) {
        case "document":
          record = await prisma.document.create({ data: baseData });
          break;
        case "resume":
          record = await prisma.resume.create({
            data: {
              ...baseData,
              category: category || "UMUM",
              echelonId: echelonId || null,
            },
          });
          break;
        case "documentation":
          record = await prisma.documentation.create({ data: baseData });
          break;
      }

      return NextResponse.json({ filePath, record }, { status: 201 });
    }

    // For logos, just return the path
    return NextResponse.json({ filePath }, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
