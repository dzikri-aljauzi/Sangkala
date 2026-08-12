import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Tanggal relatif ke hari ini supaya berguna untuk tes filter
// "minggu ini / bulan ini / tahun ini" (Bagian A)
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  return d;
}

const DUMMY_TRAININGS = [
  {
    title: "Pelatihan Manajemen Risiko Perbankan",
    location: "Hotel Aryaduta, Jakarta",
    startDate: daysFromNow(3), // dalam minggu ini
    price: "Rp 3.500.000",
    description:
      "Pelatihan intensif 2 hari untuk pejabat bank tentang identifikasi, pengukuran, dan mitigasi risiko kredit, operasional, dan likuiditas sesuai regulasi OJK terbaru.",
    imagePath: null,
  },
  {
    title: "Workshop Kepemimpinan Digital untuk Eksekutif",
    location: "The Trans Luxury Hotel, Bandung",
    startDate: daysFromNow(18), // dalam bulan ini
    price: "Rp 2.750.000",
    description:
      "Workshop 1 hari membahas strategi transformasi digital, pengambilan keputusan berbasis data, dan manajemen perubahan bagi level manajerial ke atas.",
    imagePath: null,
  },
  {
    title: "Sertifikasi GRC (Governance, Risk & Compliance) untuk Eksekutif",
    location: "Hybrid (Online & Grand Hyatt Surabaya)",
    startDate: daysFromNow(95), // dalam tahun ini, bulan berbeda
    price: "Hubungi Kami",
    description:
      "Program sertifikasi 3 hari yang membekali peserta dengan kerangka kerja GRC terintegrasi, studi kasus BUMN & perbankan, serta simulasi audit kepatuhan.",
    imagePath: null,
  },
];

async function main() {
  console.log("🌱 Seeding dummy trainings...");

  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    throw new Error(
      "Tidak ada user ADMIN ditemukan. Jalankan `npm run db:seed` dulu untuk membuat admin."
    );
  }

  for (const training of DUMMY_TRAININGS) {
    const existing = await prisma.training.findFirst({
      where: { title: training.title },
    });

    if (existing) {
      console.log(`⏭  Lewati (sudah ada): ${training.title}`);
      continue;
    }

    await prisma.training.create({
      data: {
        ...training,
        createdById: admin.id,
      },
    });
    console.log(`✅ Dibuat: ${training.title}`);
  }

  console.log("\n🎉 Selesai. Cek di http://localhost:3000/admin/pelatihan");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
