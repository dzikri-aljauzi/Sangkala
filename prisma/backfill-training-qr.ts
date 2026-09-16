import { PrismaClient } from "@prisma/client";
import { generateTrainingQrCode } from "../src/lib/training-qr";

const prisma = new PrismaClient();

// Backfill QR code buat pelatihan yang sudah ada sebelum fitur ini live.
// Default: cuma proses yang qrCodeData-nya null -- aman di-rerun berkali-kali,
// no-op kalau sudah pernah jalan. Flag --force: regenerate SEMUA row, dipakai
// kalau ketauan NEXTAUTH_URL salah pas generate pertama.
async function main() {
  const force = process.argv.includes("--force");

  const trainings = await prisma.training.findMany({
    where: force ? {} : { qrCodeData: null },
    select: { id: true, title: true },
  });

  console.log(`Ditemukan ${trainings.length} pelatihan${force ? "" : " tanpa QR code"}.`);

  for (const t of trainings) {
    const qrCodeData = await generateTrainingQrCode(t.id);
    await prisma.training.update({ where: { id: t.id }, data: { qrCodeData } });
    console.log(`QR dibuat: ${t.title}`);
  }

  console.log("Selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
