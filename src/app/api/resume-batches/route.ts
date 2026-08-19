import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

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
