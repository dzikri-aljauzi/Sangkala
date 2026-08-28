import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

type Params = {
  id: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;

    const logs = await prisma.auditLog.findMany({
      where: {
        entityType: "TRAINING",
        entityId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(logs);
  } catch (err) {
    console.error("Error fetching training audit logs:", err);
    return NextResponse.json(
      { error: "Gagal mengambil riwayat perubahan pelatihan" },
      { status: 500 }
    );
  }
}
