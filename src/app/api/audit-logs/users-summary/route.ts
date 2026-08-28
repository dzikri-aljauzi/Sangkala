import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/api-auth";

export interface SubAdminSummaryItem {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  totalLogs: number;
  lastActivityAt: Date | null;
  trainingsCount: number;
}

export async function GET() {
  const { session, error } = await requireSuperAdmin();
  if (error) return error;

  try {
    const subAdmins = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "SUPER_ADMIN"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            auditLogs: true,
            trainings: true,
          },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const summary: SubAdminSummaryItem[] = subAdmins.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      totalLogs: user._count.auditLogs,
      lastActivityAt: user.auditLogs[0]?.createdAt ?? null,
      trainingsCount: user._count.trainings,
    }));

    return NextResponse.json(summary);
  } catch (err) {
    console.error("Error fetching sub-admin summary:", err);
    return NextResponse.json(
      { error: "Gagal mengambil ringkasan Sub Admin" },
      { status: 500 }
    );
  }
}
