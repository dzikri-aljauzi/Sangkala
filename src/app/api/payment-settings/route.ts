import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

// GET info rekening pembayaran — publik, dipakai form pendaftaran training berbayar
export async function GET() {
  try {
    const settings = await prisma.paymentSetting.findUnique({
      where: { id: SETTINGS_ID },
    });

    return NextResponse.json(
      settings || { bankName: "", accountNumber: "", accountHolder: "", notes: null }
    );
  } catch (error) {
    console.error("Error fetching payment settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment settings" },
      { status: 500 }
    );
  }
}

// PUT update info rekening pembayaran — admin only
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bankName, accountNumber, accountHolder, notes } = body;

    if (
      !bankName || typeof bankName !== "string" || !bankName.trim() ||
      !accountNumber || typeof accountNumber !== "string" || !accountNumber.trim() ||
      !accountHolder || typeof accountHolder !== "string" || !accountHolder.trim()
    ) {
      return NextResponse.json(
        { error: "Nama bank, nomor rekening, dan nama pemilik rekening wajib diisi" },
        { status: 400 }
      );
    }

    const data = {
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
      updatedById: session.user.id,
    };

    const settings = await prisma.paymentSetting.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...data },
      update: data,
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating payment settings:", error);
    return NextResponse.json(
      { error: "Failed to update payment settings" },
      { status: 500 }
    );
  }
}
