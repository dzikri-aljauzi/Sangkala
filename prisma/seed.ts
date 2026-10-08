import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // ======================
  // CREATE ADMIN USERS
  // ======================
  console.log("\n👤 Creating Admin Users...");

  const admin1 = await prisma.user.upsert({
    where: { email: "admin@lna.com" },
    update: { password: await bcrypt.hash("admin123", 10), role: "SUPER_ADMIN", isActive: true },
    create: {
      email: "admin@lna.com",
      password: await bcrypt.hash("admin123", 10),
      name: "LNA Administrator",
      role: "SUPER_ADMIN",
    },
  });
  console.log("   ✅ Super Admin:", admin1.name);

  const admin2 = await prisma.user.upsert({
    where: { email: "ferry.hermansyah@lna.com" },
    update: { password: await bcrypt.hash("admin123", 10), role: "ADMIN", isActive: true },
    create: {
      email: "ferry.hermansyah@lna.com",
      password: await bcrypt.hash("admin123", 10),
      name: "Ferry Hermansyah",
      role: "ADMIN",
    },
  });
  console.log("   ✅ Admin 2:", admin2.name);

  const admin3 = await prisma.user.upsert({
    where: { email: "jasmine.putri@lna.com" },
    update: { password: await bcrypt.hash("admin123", 10), role: "ADMIN", isActive: true },
    create: {
      email: "jasmine.putri@lna.com",
      password: await bcrypt.hash("admin123", 10),
      name: "Jasmine Chantika Putri",
      role: "ADMIN",
    },
  });
  console.log("   ✅ Admin 3:", admin3.name);

  // ======================
  // CREATE ASSESSMENT
  // ======================
  console.log("\n📋 Creating Assessment...");

  const assessment = await prisma.assessment.upsert({
    where: { id: "bankaltimtara-2026" },
    update: {},
    create: {
      id: "bankaltimtara-2026",
      name: "Risk Leadership Assessment Bidang Perkreditan 2026",
      description: "Assessment Center Risk Leadership Assessment Bidang Perkreditan untuk Bank Contoh tahun 2026",
      clientName: "Bank Contoh",
      clientLogo: null,
      isActive: true,
    },
  });
  console.log("   ✅ Assessment:", assessment.name);

  // ======================
  // CREATE ASESOR USERS
  // ======================
  console.log("\n👥 Creating Asesor Users...");

  const asesor1 = await prisma.user.upsert({
    where: { email: "esti.nursumaryanti@lna.com" },
    update: {},
    create: {
      email: "esti.nursumaryanti@lna.com",
      password: await bcrypt.hash("esti123", 10),
      name: "Esti Nursumaryanti",
      role: "ASESOR",
      assessmentId: assessment.id,
    },
  });
  console.log("   ✅ Asesor 1:", asesor1.name);

  const asesor2 = await prisma.user.upsert({
    where: { email: "hadi.purnomo@lna.com" },
    update: {},
    create: {
      email: "hadi.purnomo@lna.com",
      password: await bcrypt.hash("hadi123", 10),
      name: "Hadi Purnomo",
      role: "ASESOR",
      assessmentId: assessment.id,
    },
  });
  console.log("   ✅ Asesor 2:", asesor2.name);

  const asesor3 = await prisma.user.upsert({
    where: { email: "feddy.febriansyah@lna.com" },
    update: {},
    create: {
      email: "feddy.febriansyah@lna.com",
      password: await bcrypt.hash("feddy123", 10),
      name: "Feddy Febriansyah",
      role: "ASESOR",
      assessmentId: assessment.id,
    },
  });
  console.log("   ✅ Asesor 3:", asesor3.name);

  // ======================
  // CREATE KLIEN USER
  // ======================
  console.log("\n🏦 Creating Klien User...");

  const klien = await prisma.user.upsert({
    where: { email: "farida.maylina@bankaltimtara.co.id" },
    update: {},
    create: {
      email: "farida.maylina@bankaltimtara.co.id",
      password: await bcrypt.hash("farida123", 10),
      name: "Farida Maylina",
      role: "KLIEN",
      assessmentId: assessment.id,
    },
  });
  console.log("   ✅ Klien:", klien.name);

  // ======================
  // CREATE STAFF KLIEN USER
  // ======================
  console.log("\n👩‍💼 Creating Staff Klien User...");

  const staffKlien = await prisma.user.upsert({
    where: { email: "dian.pratiwi@bankaltimtara.co.id" },
    update: {},
    create: {
      email: "dian.pratiwi@bankaltimtara.co.id",
      password: await bcrypt.hash("dian123", 10),
      name: "Dian Pratiwi",
      role: "STAFF_KLIEN",
      assessmentId: assessment.id,
    },
  });
  console.log("   ✅ Staff Klien:", staffKlien.name);

  // ======================
  // CREATE PROGRESS DATA
  // ======================
  console.log("\n📊 Creating Progress Data...");

  const progressData = [
    { activityName: "Persiapan Assessment", percentage: 100, description: "Penyusunan jadwal dan materi assessment", order: 1 },
    { activityName: "Pelaksanaan In-Tray", percentage: 100, description: "Simulasi In-Tray untuk semua peserta", order: 2 },
    { activityName: "Pelaksanaan LGD", percentage: 75, description: "Leaderless Group Discussion", order: 3 },
    { activityName: "Pelaksanaan Role Play", percentage: 50, description: "Simulasi Role Play dengan asesor", order: 4 },
    { activityName: "Interview BEI", percentage: 25, description: "Behavioral Event Interview", order: 5 },
    { activityName: "Penyusunan Laporan", percentage: 0, description: "Kompilasi dan analisis hasil assessment", order: 6 },
    { activityName: "Presentasi Hasil", percentage: 0, description: "Presentasi hasil kepada klien", order: 7 },
  ];

  for (const progress of progressData) {
    await prisma.progress.upsert({
      where: {
        id: `progress-${assessment.id}-${progress.order}`,
      },
      update: {
        percentage: progress.percentage,
      },
      create: {
        id: `progress-${assessment.id}-${progress.order}`,
        activityName: progress.activityName,
        percentage: progress.percentage,
        description: progress.description,
        order: progress.order,
        assessmentId: assessment.id,
      },
    });
  }
  console.log("   ✅ Progress data created:", progressData.length, "items");

  // ======================
  // SUMMARY
  // ======================
  console.log("\n" + "=".repeat(60));
  console.log("✨ SEED COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(60));

  console.log("\n📋 LOGIN CREDENTIALS:");
  console.log("\n🔵 ADMIN USERS (dapat login dari mana saja):");
  console.log("   1. Email: admin@lna.com");
  console.log("      Password: admin123");
  console.log("      Name: LNA Administrator");
  console.log("");
  console.log("   2. Email: ferry.hermansyah@lna.com");
  console.log("      Password: admin123");
  console.log("      Name: Ferry Hermansyah");
  console.log("");
  console.log("   3. Email: jasmine.putri@lna.com");
  console.log("      Password: admin123");
  console.log("      Name: Jasmine Chantika Putri");

  console.log("\n🟢 ASESOR USERS (hanya bisa login ke Assessment Bankaltimtara):");
  console.log("   1. Email: esti.nursumaryanti@lna.com");
  console.log("      Password: esti123");
  console.log("      Name: Esti Nursumaryanti");
  console.log("");
  console.log("   2. Email: hadi.purnomo@lna.com");
  console.log("      Password: hadi123");
  console.log("      Name: Hadi Purnomo");
  console.log("");
  console.log("   3. Email: feddy.febriansyah@lna.com");
  console.log("      Password: feddy123");
  console.log("      Name: Feddy Febriansyah");

  console.log("\n🟡 KLIEN USER (hanya bisa login ke Assessment Bankaltimtara):");
  console.log("   Email: farida.maylina@bankaltimtara.co.id");
  console.log("   Password: farida123");
  console.log("   Name: Farida Maylina");

  console.log("\n🟠 STAFF KLIEN USER (hanya bisa melihat progress, tidak bisa lihat hasil):");
  console.log("   Email: dian.pratiwi@bankaltimtara.co.id");
  console.log("   Password: dian123");
  console.log("   Name: Dian Pratiwi");

  console.log("\n📊 Progress Data: 7 kegiatan (demo data)");

  console.log("\n📍 Assessment Created:");
  console.log("   ID: bankaltimtara-2026");
  console.log("   Name: Risk Leadership Assessment Bidang Perkreditan 2026");
  console.log("   Client: Bank Contoh");

  console.log("\n🔗 Quick Links:");
  console.log("   Assessment List: http://localhost:3000/assessment-center");
  console.log("   Admin Login: http://localhost:3000/assessment-center/admin-login");
  console.log("   Bankaltimtara Login: http://localhost:3000/assessment-center/bankaltimtara-2026/login");

  console.log("\n⚠️  IMPORTANT: Change all passwords after first login!");
  console.log("=".repeat(60) + "\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
