import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/api-auth";
import { recordAuditLog } from "@/lib/audit";
import type { Prisma } from "@prisma/client";

// GET daftar pengguna — super admin only
export async function GET(request: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role")?.trim() || "";
    const assessmentId = searchParams.get("assessmentId")?.trim() || "";

    const where: Prisma.UserWhereInput = {};

    if (role && role !== "ALL") {
      where.role = role;
    }

    if (assessmentId && assessmentId !== "ALL") {
      if (assessmentId === "NONE") {
        where.assessmentId = null;
      } else {
        where.assessmentId = assessmentId;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
    const pageSize = pageSizeParam ? Math.max(1, parseInt(pageSizeParam, 10)) : 10;
    const skip = (page - 1) * pageSize;

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          assessmentId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          assessment: {
            select: {
              id: true,
              name: true,
              clientName: true,
            },
          },
          _count: {
            select: {
              trainings: true,
              auditLogs: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data pengguna" },
      { status: 500 }
    );
  }
}

// POST tambah pengguna baru — super admin only
export async function POST(request: NextRequest) {
  const { session, error } = await requireSuperAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { name, email, password, role, assessmentId } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Nama, email, password, dan role wajib diisi" },
        { status: 400 }
      );
    }

    const validRoles = ["SUPER_ADMIN", "ADMIN", "ASESOR", "KLIEN", "STAFF_KLIEN"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Role tidak valid" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let assignedAssessmentId: string | null = null;
    if (assessmentId && typeof assessmentId === "string" && assessmentId.trim() && assessmentId !== "NONE") {
      assignedAssessmentId = assessmentId.trim();
    }

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role,
        assessmentId: assignedAssessmentId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        assessmentId: true,
        isActive: true,
        createdAt: true,
        assessment: {
          select: {
            id: true,
            name: true,
            clientName: true,
          },
        },
      },
    });

    // Fire-and-forget: recordAuditLog udah nangkep error-nya sendiri secara
    // internal (nggak pernah throw), jadi nunggu ini selesai sebelum response
    // cuma nambah latency tanpa manfaat reliability apapun (issue #16).
    void recordAuditLog({
      entityType: "USER",
      entityId: newUser.id,
      action: "CREATE",
      summary: `Menambahkan akun baru: ${newUser.name} (${newUser.email}) sebagai ${newUser.role}`,
      userId: session.user.id,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (err) {
    console.error("Error creating user:", err);
    return NextResponse.json(
      { error: "Gagal membuat pengguna" },
      { status: 500 }
    );
  }
}
