import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  id: string;
};

// GET daftar pendaftar untuk satu pelatihan — admin only
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const training = await prisma.training.findUnique({ where: { id } });
    if (!training) {
      return NextResponse.json({ error: "Training not found" }, { status: 404 });
    }

    const registrants = await prisma.trainingRegistrant.findMany({
      where: { trainingId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(registrants);
  } catch (error) {
    console.error("Error fetching registrants:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrants" },
      { status: 500 }
    );
  }
}
