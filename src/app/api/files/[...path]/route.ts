import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { getContentType, isPathTraversalSafe } from "@/lib/file-serving";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params in Next.js 15
    const resolvedParams = await params;

    // Get original filename from query parameter
    const { searchParams } = new URL(request.url);
    const originalFilename = searchParams.get("filename");

    // Reconstruct file path from params
    const filePath = resolvedParams.path.join("/");

    // Security: prevent directory traversal
    if (!isPathTraversalSafe(filePath)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Full path to file
    const fullPath = join(process.cwd(), "public", "uploads", filePath);

    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read file
    const fileBuffer = await readFile(fullPath);

    // Use original filename if provided, otherwise use path filename
    const filename = originalFilename || filePath.split("/").pop() || "download";

    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": getContentType(filePath),
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}
