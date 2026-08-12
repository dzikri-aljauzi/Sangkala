import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await params in Next.js 15
    const resolvedParams = await params;

    // Reconstruct file path from params
    const filePath = resolvedParams.path.join("/");

    // Security: prevent directory traversal
    if (filePath.includes("..")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Only allow access to whitelisted uploads folders for security
    const allowedPrefixes = ["uploads/articles/", "uploads/logos/", "uploads/certificates/", "uploads/trainings/"];
    if (!allowedPrefixes.some((prefix) => filePath.startsWith(prefix))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Build absolute path
    const absolutePath = join(process.cwd(), "public", filePath);

    // Check if file exists
    if (!existsSync(absolutePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read file
    const fileBuffer = await readFile(absolutePath);

    // Determine content type based on extension
    const ext = filePath.split(".").pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
    };

    const contentType = contentTypes[ext || ""] || "application/octet-stream";

    // Return file with proper headers (inline for display, not download)
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving public image:", error);
    return NextResponse.json(
      { error: "Failed to serve image" },
      { status: 500 }
    );
  }
}
