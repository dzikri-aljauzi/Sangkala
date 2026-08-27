import "dotenv/config";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };
  return {
    email: get("--email") || "admin@lna.com",
    password: get("--password"),
    generate: args.includes("--generate"),
    dryRun: args.includes("--dry-run"),
    yes: args.includes("--yes") || args.includes("-y"),
    help: args.includes("--help") || args.includes("-h"),
    all: args.includes("--all"),
  };
}

function generatePassword(length = 16): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz2346789!@#$%*";
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  if (!/[A-Z]/.test(out)) out = "A" + out.slice(1);
  if (!/[a-z]/.test(out)) out = "a" + out.slice(1);
  if (!/[0-9]/.test(out)) out = "7" + out.slice(1);
  if (!/[!@#$%*]/.test(out)) out = out.slice(0, -1) + "!";
  return out;
}

function printHelp() {
  console.log(`
Usage: npx tsx scripts/rotate-admin-password.ts [options]

Options:
  --email <email>     Target admin email (default: admin@lna.com)
  --all               Rotate ALL admin users (ignore --email)
  --password <pass>   Set manual password (min 12 chars)
  --generate          Generate random strong password (default if no --password)
  --dry-run           Preview without writing to DB
  --yes, -y           Skip confirmation prompt
  --help, -h          Show this help

Examples:
  npx tsx scripts/rotate-admin-password.ts --email admin@lna.com --generate
  npx tsx scripts/rotate-admin-password.ts --email admin@lna.com --password "MyStr0ng!Pass123"
  npx tsx scripts/rotate-admin-password.ts --all --generate --dry-run
`);
}

async function main() {
  const opts = parseArgs();
  if (opts.help) {
    printHelp();
    return;
  }

  let newPassword = opts.password;
  if (!newPassword || opts.generate) {
    if (opts.password && opts.generate) {
      console.log("ℹ️  --generate dan --password diberikan, pakai --password manual.");
      newPassword = opts.password;
    } else if (!opts.password) {
      newPassword = generatePassword(16);
    }
  }

  if (!newPassword || newPassword.length < 12) {
    console.error("❌ Password minimal 12 karakter. Gunakan --password <min12> atau --generate.");
    process.exit(1);
  }

  const targets = opts.all
    ? await prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true, name: true, isActive: true } })
    : [{ email: opts.email }];

  if (opts.all && targets.length === 0) {
    console.error("❌ Tidak ada user dengan role ADMIN di database.");
    process.exit(1);
  }

  const emails = opts.all ? targets.map((t) => t.email) : [opts.email];

  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`❌ User tidak ditemukan: ${email}`);
      continue;
    }
    if (user.role !== "ADMIN") {
      console.error(`❌ ${email} bukan ADMIN (role=${user.role}), skip.`);
      continue;
    }
    if (!user.isActive) {
      console.error(`⚠️  ${email} isActive=false, tetap lanjut rotate.`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`🔐 ROTATE ADMIN PASSWORD`);
  console.log("=".repeat(60));
  console.log(`Target : ${emails.join(", ")}`);
  console.log(`Mode   : ${opts.dryRun ? "DRY-RUN (tidak menulis DB)" : "LIVE"}`);
  console.log(`New pass preview : ${newPassword.slice(0, 2)}***${newPassword.slice(-2)} (${newPassword.length} chars)`);
  console.log("=".repeat(60));

  if (opts.dryRun) {
    console.log("✅ Dry-run selesai — tidak ada perubahan DB.");
    console.log(`\n🔑 Password yang akan dipakai (DRY-RUN, belum disimpan):\n   ${newPassword}\n`);
    return;
  }

  if (!opts.yes) {
    console.log("\n⚠️  Akan overwrite password + hapus sesi login admin tersebut.");
    console.log("   Lanjutkan? Jalankan lagi dengan --yes untuk konfirmasi.");
    console.log(`   Contoh: npx tsx scripts/rotate-admin-password.ts --email ${emails[0]} --generate --yes\n`);
    return;
  }

  const hashed = await bcrypt.hash(newPassword!, 10);

  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== "ADMIN") continue;

    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });

    let sessionsDeleted = 0;
    try {
      const res = await prisma.session.deleteMany({ where: { userId: user.id } });
      sessionsDeleted = res.count;
    } catch {}

    console.log(`\n✅ ${email} (${user.name})`);
    console.log(`   - Password updated (bcrypt 10)`);
    console.log(`   - Sessions invalidated: ${sessionsDeleted}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🔑 PASSWORD BARU (copy sekarang, tidak disimpan di file/log):");
  console.log("=".repeat(60));
  for (const email of emails) {
    console.log(`   ${email} : ${newPassword}`);
  }
  console.log("=".repeat(60));
  console.log("⚠️  Simpan di password manager. Jangan share via chat/email plain.");
  console.log("   Test login: /admin/login\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
