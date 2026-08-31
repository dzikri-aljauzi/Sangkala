import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { isReminderEligible } from "@/lib/certification-status";
import { sendRefreshmentReminder, sendRecertificationReminder } from "@/lib/email";

// Endpoint ini nggak lewat requireAdmin() (dipicu OS crontab, bukan admin
// login), jadi CRON_SECRET adalah satu-satunya gerbang -- bandingin pakai
// timingSafeEqual, bukan `!==`, biar nggak ada timing side-channel yang bisa
// dipakai nebak secret-nya karakter demi karakter.
function isValidCronSecret(secret: string | null): boolean {
  const expected = process.env.CRON_SECRET;
  if (!secret || !expected) return false;
  const secretBuf = Buffer.from(secret);
  const expectedBuf = Buffer.from(expected);
  if (secretBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(secretBuf, expectedBuf);
}

// POST — dipicu OS crontab (bukan admin login), bukan requireAdmin().
// Scan semua pemegang sertifikasi, kirim reminder yang eligible (lihat
// isReminderEligible: belum pernah dikirim, belum ditandai selesai, dan
// checkpoint-nya jatuh dalam 30 hari ke depan). *ReminderSentAt cuma di-stamp
// kalau email BENERAN terkirim -- SMTP gagal sesaat harus bisa dicoba lagi
// besok, karena reminder ini cuma dikirim sekali seumur checkpoint.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (!isValidCronSecret(secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const errors: string[] = [];
  let refreshmentSent = 0;
  let recertSent = 0;

  try {
    const holders = await prisma.certificationHolder.findMany();

    for (const holder of holders) {
      try {
        if (
          isReminderEligible(
            holder.refreshment1Date,
            holder.refreshment1ReminderSentAt,
            holder.refreshment1CompletedAt,
            today
          )
        ) {
          const sent = await sendRefreshmentReminder({
            to: holder.email,
            name: holder.name,
            certificationName: holder.certificationName,
            checkpointLabel: "Tahun Pertama",
            checkpointDate: holder.refreshment1Date,
          });
          if (sent) {
            await prisma.certificationHolder.update({
              where: { id: holder.id },
              data: { refreshment1ReminderSentAt: today },
            });
            refreshmentSent += 1;
          }
        }

        if (
          isReminderEligible(
            holder.refreshment2Date,
            holder.refreshment2ReminderSentAt,
            holder.refreshment2CompletedAt,
            today
          )
        ) {
          const sent = await sendRefreshmentReminder({
            to: holder.email,
            name: holder.name,
            certificationName: holder.certificationName,
            checkpointLabel: "Tahun Kedua",
            checkpointDate: holder.refreshment2Date,
          });
          if (sent) {
            await prisma.certificationHolder.update({
              where: { id: holder.id },
              data: { refreshment2ReminderSentAt: today },
            });
            refreshmentSent += 1;
          }
        }

        if (
          isReminderEligible(
            holder.expiryDate,
            holder.recertReminderSentAt,
            holder.recertCompletedAt,
            today
          )
        ) {
          const sent = await sendRecertificationReminder({
            to: holder.email,
            name: holder.name,
            certificationName: holder.certificationName,
            expiryDate: holder.expiryDate,
          });
          if (sent) {
            await prisma.certificationHolder.update({
              where: { id: holder.id },
              data: { recertReminderSentAt: today },
            });
            recertSent += 1;
          }
        }
      } catch (holderError) {
        console.error(`Error processing reminder for holder ${holder.id}:`, holderError);
        errors.push(`${holder.bsmrId}: ${String(holderError)}`);
      }
    }

    return NextResponse.json({
      scanned: holders.length,
      refreshmentSent,
      recertSent,
      errors,
    });
  } catch (error) {
    console.error("Error running certification reminder cron:", error);
    return NextResponse.json(
      { error: "Failed to run certification reminder cron" },
      { status: 500 }
    );
  }
}
