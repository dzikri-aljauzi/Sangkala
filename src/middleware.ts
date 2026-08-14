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

  if (!token || token.role !== "ADMIN") {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
