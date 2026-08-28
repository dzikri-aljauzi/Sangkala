import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { recordAuditLog, computeChangesDiff } from "@/lib/audit";

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

// PUT update info rekening pembayaran — super admin only
export async function PUT(request: NextRequest) {
  try {
    const { session, error } = await requireSuperAdmin();
    if (error) return error;

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

    const existing = await prisma.paymentSetting.findUnique({
      where: { id: SETTINGS_ID },
    });

    const data = {
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
      updatedById: session.user.id,
    };

    const changes = computeChangesDiff(
      {
        bankName: existing?.bankName || "",
        accountNumber: existing?.accountNumber || "",
        accountHolder: existing?.accountHolder || "",
        notes: existing?.notes || null,
      },
      data
    );

    const settings = await prisma.paymentSetting.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...data },
      update: data,
    });

    await recordAuditLog({
      entityType: "PAYMENT_SETTING",
      entityId: SETTINGS_ID,
      action: "UPDATE",
      summary: `Memperbarui data rekening pembayaran (${data.bankName} - ${data.accountNumber})`,
      changes,
      userId: session.user.id,
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
