import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

// Dulu di-copy-paste manual di hampir semua route API admin — satu sumber
// kebenaran buat pengecekan "apakah request ini dari admin atau super admin?".
export async function requireAdmin(): Promise<
  { session: Session; error: null } | { session: null; error: NextResponse }
> {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, error: null };
}

export async function requireSuperAdmin(): Promise<
  { session: Session; error: null } | { session: null; error: NextResponse }
> {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 }),
    };
  }

  return { session, error: null };
}

