import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { requireAdmin } from "@/lib/api-auth";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"];

// Dulu di-copy-paste identik di upload/training dan upload/article (beda cuma
// nama folder tujuan) — satu implementasi dipakai bareng, URL endpoint tetap
// dua (/api/upload/training, /api/upload/article) supaya caller tidak berubah.
export async function handleImageAssetUpload(request: NextRequest, folder: string) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const uploadDir = join(process.cwd(), "public", "uploads", folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const path = join(uploadDir, fileName);
    await writeFile(path, buffer);

    const filePath = `/uploads/${folder}/${fileName}`;

    return NextResponse.json({ filePath }, { status: 201 });
  } catch (error) {
    console.error(`Error uploading image to ${folder}:`, error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
