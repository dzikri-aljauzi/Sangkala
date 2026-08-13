-- CreateTable
CREATE TABLE "payment_settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "bankName" TEXT NOT NULL DEFAULT '',
    "accountNumber" TEXT NOT NULL DEFAULT '',
    "accountHolder" TEXT NOT NULL DEFAULT '',
    "notes" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "updatedById" TEXT,
    CONSTRAINT "payment_settings_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_training_registrants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trainingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "institution" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentProofPath" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
    "rejectionReason" TEXT,
    "reviewedAt" DATETIME,
    "reviewedById" TEXT,
    CONSTRAINT "training_registrants_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "trainings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "training_registrants_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_training_registrants" ("createdAt", "email", "id", "institution", "name", "phone", "trainingId") SELECT "createdAt", "email", "id", "institution", "name", "phone", "trainingId" FROM "training_registrants";
DROP TABLE "training_registrants";
ALTER TABLE "new_training_registrants" RENAME TO "training_registrants";
CREATE INDEX "training_registrants_trainingId_idx" ON "training_registrants"("trainingId");
CREATE INDEX "training_registrants_reviewedById_idx" ON "training_registrants"("reviewedById");
CREATE TABLE "new_trainings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "price" TEXT,
    "description" TEXT NOT NULL,
    "imagePath" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresPayment" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "trainings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_trainings" ("createdAt", "createdById", "description", "id", "imagePath", "isActive", "location", "price", "startDate", "title", "updatedAt") SELECT "createdAt", "createdById", "description", "id", "imagePath", "isActive", "location", "price", "startDate", "title", "updatedAt" FROM "trainings";
DROP TABLE "trainings";
ALTER TABLE "new_trainings" RENAME TO "trainings";
CREATE INDEX "trainings_createdById_idx" ON "trainings"("createdById");
CREATE INDEX "trainings_startDate_idx" ON "trainings"("startDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
