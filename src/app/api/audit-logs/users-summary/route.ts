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
    const [subAdmins, lastActivities] = await Promise.all([
      prisma.user.findMany({
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
        },
        orderBy: { name: "asc" },
      }),
      prisma.auditLog.groupBy({
        by: ["userId"],
        _max: {
          createdAt: true,
        },
      }),
    ]);

    const lastActivityMap = new Map<string, Date>();
    for (const item of lastActivities) {
      if (item._max.createdAt) {
        lastActivityMap.set(item.userId, item._max.createdAt);
      }
    }

    const summary: SubAdminSummaryItem[] = subAdmins.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      totalLogs: user._count.auditLogs,
      lastActivityAt: lastActivityMap.get(user.id) ?? null,
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
