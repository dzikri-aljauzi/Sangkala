import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

// DELETE documentation (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    const documentation = await prisma.documentation.findUnique({
      where: { id },
    });

    if (!documentation) {
      return NextResponse.json(
        { error: "Documentation not found" },
        { status: 404 }
      );
    }

    // Delete file from filesystem
    try {
      const filePath = join(process.cwd(), "public", documentation.filePath);
      await unlink(filePath);
    } catch (error) {
      console.error("Error deleting file:", error);
    }

    // Delete from database
    await prisma.documentation.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Documentation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting documentation:", error);
    return NextResponse.json(
      { error: "Failed to delete documentation" },
      { status: 500 }
    );
  }
}
