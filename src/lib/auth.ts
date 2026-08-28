import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        assessmentId: { label: "Assessment ID", type: "text", optional: true },
        loginRole: { label: "Login Role", type: "text", optional: true },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password harus diisi");
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { assessment: true },
        });

        if (!user) {
          throw new Error("Email atau password salah");
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          throw new Error("Email atau password salah");
        }

        // Check if user is active
        if (user.isActive === false) {
          throw new Error("Akun Anda telah dinonaktifkan. Silakan hubungi administrator.");
        }

        // Validate login role matches user's actual role
        const loginRole = credentials.loginRole;
        if (loginRole) {
          if (loginRole === "ADMIN" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
            throw new Error("Akun ini bukan admin. Silakan gunakan tab login yang sesuai.");
          }
          if (loginRole === "ASESOR" && user.role !== "ASESOR") {
            throw new Error("Akun ini bukan asesor. Silakan gunakan tab login yang sesuai.");
          }
          // KLIEN tab can be used by both KLIEN and STAFF_KLIEN
          if (loginRole === "KLIEN" && user.role !== "KLIEN" && user.role !== "STAFF_KLIEN") {
            throw new Error("Akun ini bukan klien. Silakan gunakan tab login yang sesuai.");
          }
        }

        // Role-based validation
        if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
          // Admin and Super Admin can login from anywhere (no assessmentId needed)
        } else {
          // ASESOR, KLIEN, and STAFF_KLIEN MUST provide assessmentId
          if (!credentials.assessmentId) {
            throw new Error("Assessment ID diperlukan untuk role ini");
          }

          // Verify they're accessing the correct assessment
          if (user.assessmentId !== credentials.assessmentId) {
            throw new Error("Anda tidak memiliki akses ke assessment ini. Silakan login melalui assessment yang sesuai.");
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          assessmentId: user.assessmentId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.assessmentId = user.assessmentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.assessmentId = token.assessmentId as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 day
  },
  secret: process.env.NEXTAUTH_SECRET,
};
