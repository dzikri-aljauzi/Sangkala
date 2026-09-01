import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface UserBatchInput {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  assessmentId?: string;
}

// POST batch create users (Admin only)
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const data = await request.json();
    const users: UserBatchInput[] = data.users;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: "Users array is required" },
        { status: 400 }
      );
    }

    // Validate all users
    for (const user of users) {
      if (!user.name || !user.email || !user.password || !user.role) {
        return NextResponse.json(
          { error: "All fields (name, email, password, role) are required for each user" },
          { status: 400 }
        );
      }

      if (!["ASESOR", "KLIEN"].includes(user.role)) {
        return NextResponse.json(
          { error: "Invalid role. Only ASESOR and KLIEN can be batch created" },
          { status: 400 }
        );
      }

      if (!user.assessmentId) {
        return NextResponse.json(
          { error: "Assessment ID is required for each user" },
          { status: 400 }
        );
      }
    }

    // Check for duplicate emails
    const emails = users.map((u) => u.email || "");
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      return NextResponse.json(
        { error: "Duplicate emails found in the batch" },
        { status: 400 }
      );
    }

    // Check if any email already exists
    const existingUsers = await prisma.user.findMany({
      where: {
        email: { in: emails },
      },
      select: { email: true },
    });

    if (existingUsers.length > 0) {
      const existingEmails = existingUsers.map((u) => u.email).join(", ");
      return NextResponse.json(
        { error: `Email sudah terdaftar: ${existingEmails}` },
        { status: 400 }
      );
    }

    // Hash all passwords and create users
    const createdUsers = [];
    for (const user of users) {
      if (!user.name || !user.email || !user.password || !user.role || !user.assessmentId) continue;
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const created = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role as "ASESOR" | "KLIEN",
          assessmentId: user.assessmentId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          assessmentId: true,
          createdAt: true,
        },
      });
      createdUsers.push(created);
    }

    return NextResponse.json(
      { message: `${createdUsers.length} users created successfully`, users: createdUsers },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error batch creating users:", error);
    return NextResponse.json(
      { error: "Failed to create users" },
      { status: 500 }
    );
  }
}
