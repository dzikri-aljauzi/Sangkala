import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface ImportRecord {
  bsmrId?: string;
  name?: string;
  institution?: string;
  level?: string;
  certificationName?: string;
  email?: string;
  examDate?: string;
  expiryDate?: string;
  refreshment1Date?: string;
  refreshment2Date?: string;
}

interface ImportError {
  row: number;
  reason: string;
}

const REQUIRED_FIELDS: (keyof ImportRecord)[] = [
  "bsmrId",
  "name",
  "institution",
  "level",
  "certificationName",
  "email",
  "examDate",
  "expiryDate",
  "refreshment1Date",
  "refreshment2Date",
];

function parseValidDate(value: string | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// POST bulk import pemegang sertifikasi dari Excel — admin only.
// Body: { records: [...] } sudah di-parse jadi JSON di client (bukan file mentah).
// Upsert per bsmrId: baris baru dibuat, baris existing di-update. *ReminderSentAt
// DAN *CompletedAt checkpoint terkait sama-sama direset kalau tanggalnya beneran
// berubah -- artinya siklus baru (misal holder recertifikasi, tanggalnya di-import
// ulang) mulai bersih: status/reminder nggak nyangkut ke completedAt siklus lama.
// (Revisi dari keputusan awal "CompletedAt nggak pernah direset" -- lihat changelog
// fitur ini bagian audit final buat alasannya.)
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const records: ImportRecord[] = Array.isArray(body?.records) ? body.records : [];

    if (records.length === 0) {
      return NextResponse.json({ error: "Tidak ada data untuk diimport" }, { status: 400 });
    }

    const errors: ImportError[] = [];
    const validRows: {
      rowIndex: number;
      data: {
        bsmrId: string;
        name: string;
        institution: string;
        level: string;
        certificationName: string;
        email: string;
        examDate: Date;
        expiryDate: Date;
        refreshment1Date: Date;
        refreshment2Date: Date;
      };
    }[] = [];

    records.forEach((record, index) => {
      const rowNumber = index + 1;
      // .trim() di sini, bukan cuma !record[field] -- string spasi doang
      // ("   ") itu truthy, jadi tanpa trim bakal lolos validasi terus
      // kesimpen jadi bsmrId/nama dsb yang kosong secara efektif.
      const missing = REQUIRED_FIELDS.filter((field) => !record[field]?.trim());
      if (missing.length > 0) {
        errors.push({ row: rowNumber, reason: `Kolom kosong: ${missing.join(", ")}` });
        return;
      }

      const examDate = parseValidDate(record.examDate);
      const expiryDate = parseValidDate(record.expiryDate);
      const refreshment1Date = parseValidDate(record.refreshment1Date);
      const refreshment2Date = parseValidDate(record.refreshment2Date);

      if (!examDate || !expiryDate || !refreshment1Date || !refreshment2Date) {
        errors.push({ row: rowNumber, reason: "Salah satu kolom tanggal tidak valid" });
        return;
      }

      validRows.push({
        rowIndex: rowNumber,
        data: {
          bsmrId: record.bsmrId!.toString().trim(),
          name: record.name!.toString().trim(),
          institution: record.institution!.toString().trim(),
          level: record.level!.toString().trim(),
          certificationName: record.certificationName!.toString().trim(),
          email: record.email!.toString().trim(),
          examDate,
          expiryDate,
          refreshment1Date,
          refreshment2Date,
        },
      });
    });

    if (validRows.length === 0) {
      return NextResponse.json({ created: 0, updated: 0, errors });
    }

    const existingHolders = await prisma.certificationHolder.findMany({
      where: { bsmrId: { in: validRows.map((row) => row.data.bsmrId) } },
    });
    const existingByBsmrId = new Map(existingHolders.map((holder) => [holder.bsmrId, holder]));
    const queuedForCreate = new Set<string>();

    let created = 0;
    let updated = 0;
    const operations: Prisma.PrismaPromise<unknown>[] = [];

    for (const row of validRows) {
      const existing = existingByBsmrId.get(row.data.bsmrId);

      if (!existing) {
        // ID BSMR yang sama muncul >1x di file yang sama dan belum ada di DB --
        // kalau dibiarkan, dua create() dengan bsmrId sama bakal nabrak unique
        // constraint dan bikin SELURUH transaksi batal (termasuk baris lain
        // yang valid). Baris duplikat kedua-dst ditolak per-baris di sini.
        if (queuedForCreate.has(row.data.bsmrId)) {
          errors.push({ row: row.rowIndex, reason: `ID BSMR "${row.data.bsmrId}" duplikat di file yang sama` });
          continue;
        }
        queuedForCreate.add(row.data.bsmrId);
        created += 1;
        operations.push(prisma.certificationHolder.create({ data: row.data }));
        continue;
      }

      updated += 1;
      const refreshment1DateChanged = existing.refreshment1Date.getTime() !== row.data.refreshment1Date.getTime();
      const refreshment2DateChanged = existing.refreshment2Date.getTime() !== row.data.refreshment2Date.getTime();
      const expiryDateChanged = existing.expiryDate.getTime() !== row.data.expiryDate.getTime();

      operations.push(
        prisma.certificationHolder.update({
          where: { id: existing.id },
          data: {
            ...row.data,
            refreshment1ReminderSentAt: refreshment1DateChanged ? null : undefined,
            refreshment2ReminderSentAt: refreshment2DateChanged ? null : undefined,
            recertReminderSentAt: expiryDateChanged ? null : undefined,
            refreshment1CompletedAt: refreshment1DateChanged ? null : undefined,
            refreshment2CompletedAt: refreshment2DateChanged ? null : undefined,
            recertCompletedAt: expiryDateChanged ? null : undefined,
          },
        })
      );
    }

    await prisma.$transaction(operations);

    return NextResponse.json({ created, updated, errors });
  } catch (error) {
    console.error("Error importing certification holders:", error);
    return NextResponse.json(
      { error: "Failed to import certification holders" },
      { status: 500 }
    );
  }
}
