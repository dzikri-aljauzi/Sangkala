import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, assessmentId } = await request.json();

    if (!name || !assessmentId) {
      return NextResponse.json(
        { error: "Name and assessmentId are required" },
        { status: 400 }
      );
    }

    const batch = await prisma.resumeBatch.create({
      data: {
        name: name.trim(),
        assessmentId,
      },
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Nama batch sudah ada untuk assessment ini" },
        { status: 409 }
      );
    }

    console.error("Error creating resume batch:", error);
    return NextResponse.json(
      { error: "Failed to create resume batch" },
      { status: 500 }
    );
  }
}
