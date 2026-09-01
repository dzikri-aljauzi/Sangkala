import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/api-auth";
import { recordAuditLog, computeChangesDiff } from "@/lib/audit";

type Params = {
  id: string;
};

// PUT update user — super admin only
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { session, error } = await requireSuperAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, role, isActive, newPassword, assessmentId } = body;

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    // Lockout Guard: Super Admin tidak boleh menurunkan role sendiri atau menonaktifkan akun sendiri
    if (id === session.user.id) {
      if (role && role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Anda tidak dapat mengubah role akun Super Admin Anda sendiri untuk mencegah kehilangan akses sistem" },
          { status: 400 }
        );
      }
      if (isActive === false) {
        return NextResponse.json(
          { error: "Anda tidak dapat menonaktifkan akun Super Admin Anda sendiri" },
          { status: 400 }
        );
      }
    }

    const updateData: {
      name?: string;
      email?: string;
      role?: string;
      assessmentId?: string | null;
      isActive?: boolean;
      password?: string;
    } = {};

    if (name && typeof name === "string") updateData.name = name.trim();
    if (email && typeof email === "string") {
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== existing.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (emailExists) {
          return NextResponse.json({ error: "Email sudah digunakan oleh akun lain" }, { status: 400 });
        }
        updateData.email = normalizedEmail;
      }
    }
    if (role && typeof role === "string") {
      const validRoles = ["SUPER_ADMIN", "ADMIN", "ASESOR", "KLIEN", "STAFF_KLIEN"];
      if (validRoles.includes(role)) {
        updateData.role = role;
      }
    }
    if (assessmentId !== undefined) {
      if (assessmentId === null || assessmentId === "" || assessmentId === "NONE") {
        updateData.assessmentId = null;
      } else {
        updateData.assessmentId = String(assessmentId).trim();
      }
    }
    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }
    if (newPassword && typeof newPassword === "string" && newPassword.trim()) {
      updateData.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    const changes = computeChangesDiff(
      {
        name: existing.name,
        email: existing.email,
        role: existing.role,
        assessmentId: existing.assessmentId,
        isActive: existing.isActive,
      },
      {
        name: updateData.name,
        email: updateData.email,
        role: updateData.role,
        assessmentId: updateData.assessmentId,
        isActive: updateData.isActive,
      }
    );

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        assessmentId: true,
        isActive: true,
        updatedAt: true,
        assessment: {
          select: {
            id: true,
            name: true,
            clientName: true,
          },
        },
      },
    });

    const isStatusOnly = Object.keys(changes).length === 1 && "isActive" in changes;
    const isPasswordReset = !!updateData.password;
    const action = isPasswordReset ? "PASSWORD_RESET" : isStatusOnly ? "STATUS_CHANGE" : "UPDATE";

    let summary = `Mengubah data pengguna: ${updated.name} (${updated.email})`;
    if (isPasswordReset) {
      summary = `Mereset password untuk akun ${updated.name} (${updated.email})`;
    } else if (isStatusOnly) {
      summary = `${updated.isActive ? "Mengaktifkan" : "Menonaktifkan"} akun ${updated.name}`;
    }

    // Fire-and-forget -- lihat catatan yang sama di route.ts POST (issue #16).
    void recordAuditLog({
      entityType: "USER",
      entityId: updated.id,
      action,
      summary,
      changes: Object.keys(changes).length > 0 ? changes : null,
      userId: session.user.id,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui pengguna" },
      { status: 500 }
    );
  }
}

// DELETE hapus user — super admin only
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { session, error } = await requireSuperAdmin();
  if (error) return error;

  try {
    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Anda tidak dapat menghapus akun Anda sendiri" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id },
    });

    // Fire-and-forget -- lihat catatan yang sama di route.ts POST (issue #16).
    void recordAuditLog({
      entityType: "USER",
      entityId: id,
      action: "DELETE",
      summary: `Menghapus akun pengguna: ${existing.name} (${existing.email} - ${existing.role})`,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true, message: "Pengguna berhasil dihapus" });
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json(
      { error: "Gagal menghapus pengguna" },
      { status: 500 }
    );
  }
}
