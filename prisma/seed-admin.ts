// Seed minimal untuk deploy: hanya satu akun SUPER_ADMIN, tanpa data demo.
// Berbeda dari seed.ts, tidak ada password bawaan: ADMIN_PASSWORD wajib diisi.
//
//   ADMIN_PASSWORD="<password kuat>" npm run db:seed-admin
//   (opsional) ADMIN_EMAIL, ADMIN_NAME
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 12) {
    console.error("ADMIN_PASSWORD wajib diisi dan minimal 12 karakter.");
    process.exit(1);
  }

  // Disimpan huruf kecil; login mencocokkan email apa adanya.
  const email = (process.env.ADMIN_EMAIL || "admin@sangkala.example").trim().toLowerCase();
  const name = process.env.ADMIN_NAME || "Sangkala Admin";
  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hash, name, role: "SUPER_ADMIN", isActive: true },
    create: { email, password: hash, name, role: "SUPER_ADMIN" },
  });

  console.log(`Super admin siap: ${user.email} (login di /admin/login)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
