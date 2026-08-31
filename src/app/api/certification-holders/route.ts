import { NextRequest, NextResponse } from "next/server";
import { addYears } from "date-fns";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getCertificationStatus } from "@/lib/certification-status";
import type { CertificationHolder, CertificationStatus } from "@/types/certification-holder";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// GET list pemegang sertifikasi — admin only. Query opsional: ?search= & ?status= & ?level= & ?page= & ?pageSize=
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const level = searchParams.get("level") || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE)
    );

    // Cuma `search` yang di-query ke DB -- level & status difilter di JS (di
    // bawah) karena status computed (bukan kolom), dan level ikut difilter di
    // sini juga supaya bisa dipakai turunin levelOptions/statusCounts yang
    // scope-nya lebih luas dari hasil akhir yang dikirim ke client.
    const whereClause: Prisma.CertificationHolderWhereInput = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { bsmrId: { contains: search } },
        { institution: { contains: search } },
      ];
    }

    const searchScoped = await prisma.certificationHolder.findMany({
      where: whereClause,
      orderBy: { expiryDate: "asc" },
    });

    const withStatus = searchScoped.map((holder) => ({
      ...holder,
      status: getCertificationStatus(holder as unknown as CertificationHolder),
    }));

    // levelOptions diturunkan dari scope search SAJA (bukan dari `filtered`/`items`
    // di bawah) -- supaya milih satu Jenjang tidak diam-diam menghilangkan Jenjang
    // lain dari pilihan dropdown.
    const levelOptions = Array.from(new Set(withStatus.map((h) => h.level))).sort();

    const levelScoped = level ? withStatus.filter((h) => h.level === level) : withStatus;

    // statusCounts diturunkan dari scope search+level, SEBELUM filter status --
    // supaya kartu ringkasan tetap akurat walau lagi filter ke satu status tertentu.
    const statusCounts: Record<CertificationStatus, number> = {
      AKTIF: 0,
      MENDEKATI_REFRESHMENT: 0,
      MENDEKATI_KADALUARSA: 0,
      KADALUARSA: 0,
    };
    for (const holder of levelScoped) statusCounts[holder.status] += 1;

    const filtered = status
      ? levelScoped.filter((holder) => holder.status === (status as CertificationStatus))
      : levelScoped;

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return NextResponse.json({ items, total, page, pageSize, totalPages, statusCounts, levelOptions });
  } catch (error) {
    console.error("Error fetching certification holders:", error);
    return NextResponse.json(
      { error: "Failed to fetch certification holders" },
      { status: 500 }
    );
  }
}

// POST tambah manual satu pemegang sertifikasi — admin only
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const {
      bsmrId,
      name,
      institution,
      level,
      certificationName,
      email,
      examDate,
      expiryDate,
      refreshment1Date,
      refreshment2Date,
    } = body;

    if (!bsmrId || !name || !institution || !level || !certificationName || !email || !examDate) {
      return NextResponse.json(
        { error: "ID BSMR, nama, instansi, jenjang, sertifikasi, email, dan tanggal ujian wajib diisi" },
        { status: 400 }
      );
    }

    const parsedExamDate = new Date(examDate);

    const holder = await prisma.certificationHolder.create({
      data: {
        bsmrId,
        name,
        institution,
        level,
        certificationName,
        email,
        examDate: parsedExamDate,
        expiryDate: expiryDate ? new Date(expiryDate) : addYears(parsedExamDate, 3),
        refreshment1Date: refreshment1Date ? new Date(refreshment1Date) : addYears(parsedExamDate, 1),
        refreshment2Date: refreshment2Date ? new Date(refreshment2Date) : addYears(parsedExamDate, 2),
      },
    });

    return NextResponse.json(holder, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "ID BSMR sudah terdaftar" },
        { status: 400 }
      );
    }
    console.error("Error creating certification holder:", error);
    return NextResponse.json(
      { error: "Failed to create certification holder" },
      { status: 500 }
    );
  }
}
