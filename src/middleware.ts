import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Proteksi semua /admin/* kecuali /admin/login — cek sekali di server,
// sebelum halaman dikirim, gantiin pengecekan useSession()+redirect yang
// dulu di-copy-paste manual di tiap halaman admin.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token || (token.role !== "ADMIN" && token.role !== "SUPER_ADMIN")) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Khusus route /admin/users, /admin/audit-log, dan /admin/pelatihan/pengaturan-pembayaran hanya untuk SUPER_ADMIN
  if (
    (pathname.startsWith("/admin/users") ||
      pathname.startsWith("/admin/audit-log") ||
      pathname.startsWith("/admin/pelatihan/pengaturan-pembayaran")) &&
    token.role !== "SUPER_ADMIN"
  ) {
    const redirectUrl = new URL(
      pathname.startsWith("/admin/pelatihan/pengaturan-pembayaran")
        ? "/admin/pelatihan"
        : "/admin",
      request.url
    );
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
