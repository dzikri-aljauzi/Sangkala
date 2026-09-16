-- AlterTable: template pilihan + data khusus per-template (JSON text, tanpa migrasi lagi untuk template baru)
ALTER TABLE "certificates" ADD COLUMN "template" TEXT NOT NULL DEFAULT 'template-1';
ALTER TABLE "certificates" ADD COLUMN "templateData" TEXT;
