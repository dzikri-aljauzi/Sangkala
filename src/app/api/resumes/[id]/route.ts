import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

// DELETE resume (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Delete file from filesystem
    try {
      const filePath = join(process.cwd(), "public", resume.filePath);
      await unlink(filePath);
    } catch (error) {
      console.error("Error deleting file:", error);
    }

    // Delete from database
    await prisma.resume.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    );
  }
}
