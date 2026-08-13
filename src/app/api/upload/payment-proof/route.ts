import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Upload bukti transfer pembayaran — PUBLIK (tanpa login), dipakai di form
// pendaftaran training berbayar. Karena tanpa auth, ekstensi file diambil dari
// MIME type yang kita kontrol sendiri (bukan dari nama file klien).
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const ext = MIME_TO_EXT[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, GIF, atau PDF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5MB." },
        { status: 400 }
      );
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const uploadDir = join(process.cwd(), "public", "uploads", "payment-proofs");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const path = join(uploadDir, fileName);
    await writeFile(path, buffer);

    const filePath = `/uploads/payment-proofs/${fileName}`;

    return NextResponse.json({ filePath }, { status: 201 });
  } catch (error) {
    console.error("Error uploading payment proof:", error);
    return NextResponse.json(
      { error: "Failed to upload payment proof" },
      { status: 500 }
    );
  }
}
