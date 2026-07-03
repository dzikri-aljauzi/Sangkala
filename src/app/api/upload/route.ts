import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { ensureLegacyResumeBatch } from "@/lib/resume-batches";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const type = formData.get("type") as string;
    const assessmentId = formData.get("assessmentId") as string;
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const echelonId = formData.get("echelonId") as string | null;
    const resumeBatchId = formData.get("resumeBatchId") as string | null;
    const files = formData
      .getAll("files")
      .filter((value): value is File => value instanceof File && value.size > 0);
    const singleFile = formData.get("file");

    if (
      singleFile instanceof File &&
      singleFile.size > 0 &&
      !files.some((file) => file.name === singleFile.name && file.size === singleFile.size)
    ) {
      files.push(singleFile);
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!type || !assessmentId) {
      return NextResponse.json(
        { error: "Type and assessment ID are required" },
        { status: 400 }
      );
    }

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

    for (const file of files) {
      if (!allowedTypes[type]?.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}` },
          { status: 400 }
        );
      }
    }

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

    if (type === "resume") {
      if (!resumeBatchId) {
        return NextResponse.json(
          { error: "Resume batch wajib dipilih" },
          { status: 400 }
        );
      }

      if (category === "ESELON" && !echelonId) {
        return NextResponse.json(
          { error: "Pilih eselon terlebih dahulu" },
          { status: 400 }
        );
      }

      if ((category === "UMUM" || category === "ESELON") && !title?.trim()) {
        return NextResponse.json(
          { error: "Title wajib diisi untuk resume non-individu" },
          { status: 400 }
        );
      }
    }

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

    const outputDir = join(process.cwd(), "public", "uploads", uploadDir);
    await mkdir(outputDir, { recursive: true });

    let resolvedResumeBatchId = resumeBatchId;
    if (type === "resume" && !resolvedResumeBatchId) {
      const legacyBatch = await ensureLegacyResumeBatch(assessmentId);
      resolvedResumeBatchId = legacyBatch.id;
    }

    const records = [];

    for (const file of files) {
      const timestamp = Date.now();
      const fileExt = file.name.split(".").pop();
      const generatedFileName = `${timestamp}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const path = join(outputDir, generatedFileName);
      await writeFile(path, buffer);

      const filePath = `/uploads/${uploadDir}/${generatedFileName}`;

      if (type === "logo") {
        return NextResponse.json({ filePath }, { status: 201 });
      }

      const finalTitle =
        type === "resume" && category === "INDIVIDU"
          ? file.name.replace(/\.[^/.]+$/, "")
          : title || file.name;

      const baseData = {
        title: finalTitle,
        fileName: file.name,
        filePath,
        assessmentId,
        uploadedById: session.user.id,
      };

      let record;
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
              resumeBatchId: resolvedResumeBatchId,
            },
          });
          break;
        case "documentation":
          record = await prisma.documentation.create({ data: baseData });
          break;
      }

      if (record) {
        records.push(record);
      }
    }

    return NextResponse.json({ records }, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
