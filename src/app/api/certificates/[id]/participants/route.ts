import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  id: string;
};

// POST add a participant to a certificate
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Participant name is required" }, { status: 400 });
    }

    const certificate = await prisma.certificate.findUnique({
      where: { id },
    });

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    const participant = await prisma.certificateParticipant.create({
      data: {
        name,
        certificateId: id,
      },
    });

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error("Error adding participant:", error);
    return NextResponse.json(
      { error: "Failed to add participant" },
      { status: 500 }
    );
  }
}

// PUT update a participant name
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { participantId, name } = body;

    if (!participantId || !name) {
      return NextResponse.json(
        { error: "Participant ID and name are required" },
        { status: 400 }
      );
    }

    const participant = await prisma.certificateParticipant.findFirst({
      where: {
        id: participantId,
        certificateId: id,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found for this certificate" },
        { status: 404 }
      );
    }

    const updated = await prisma.certificateParticipant.update({
      where: { id: participantId },
      data: { name },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating participant:", error);
    return NextResponse.json(
      { error: "Failed to update participant" },
      { status: 500 }
    );
  }
}

// DELETE a participant from a certificate
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get("participantId");

    if (!participantId) {
      return NextResponse.json(
        { error: "Participant ID is required" },
        { status: 400 }
      );
    }

    const participant = await prisma.certificateParticipant.findFirst({
      where: {
        id: participantId,
        certificateId: id,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found for this certificate" },
        { status: 404 }
      );
    }

    await prisma.certificateParticipant.delete({
      where: { id: participantId },
    });

    return NextResponse.json({ message: "Participant removed successfully" });
  } catch (error) {
    console.error("Error removing participant:", error);
    return NextResponse.json(
      { error: "Failed to remove participant" },
      { status: 500 }
    );
  }
}
