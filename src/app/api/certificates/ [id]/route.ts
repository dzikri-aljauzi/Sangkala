import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

type Params = {
  id: string;
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
    });

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // Try deleting the physical PDF file
    if (certificate.pdfPath) {
      const fullPath = path.join(process.cwd(), "public", certificate.pdfPath);
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        console.error("Failed to delete PDF file:", err);
        // We continue deleting from database even if file system delete fails
      }
    }

    // Delete from DB
    await prisma.certificate.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Certificate deleted successfully" });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    return NextResponse.json(
      { error: "Failed to delete certificate" },
      { status: 500 }
    );
  }
}
