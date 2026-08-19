import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { getContentType, isPathTraversalSafe } from "@/lib/file-serving";

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
    if (!isPathTraversalSafe(filePath)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Only allow access to whitelisted uploads folders for security
    const allowedPrefixes = ["uploads/articles/", "uploads/logos/", "uploads/certificates/", "uploads/trainings/", "uploads/payment-proofs/"];
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

    // Return file with proper headers (inline for display, not download)
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": getContentType(filePath),
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
