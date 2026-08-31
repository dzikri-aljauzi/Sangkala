-- CreateTable
CREATE TABLE "certification_holders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bsmrId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "certificationName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "examDate" DATETIME NOT NULL,
    "expiryDate" DATETIME NOT NULL,
    "refreshment1Date" DATETIME NOT NULL,
    "refreshment2Date" DATETIME NOT NULL,
    "refreshment1CompletedAt" DATETIME,
    "refreshment2CompletedAt" DATETIME,
    "recertCompletedAt" DATETIME,
    "refreshment1ReminderSentAt" DATETIME,
    "refreshment2ReminderSentAt" DATETIME,
    "recertReminderSentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "certification_holders_bsmrId_key" ON "certification_holders"("bsmrId");

-- CreateIndex
CREATE INDEX "certification_holders_expiryDate_idx" ON "certification_holders"("expiryDate");

-- CreateIndex
CREATE INDEX "certification_holders_refreshment1Date_idx" ON "certification_holders"("refreshment1Date");

-- CreateIndex
CREATE INDEX "certification_holders_refreshment2Date_idx" ON "certification_holders"("refreshment2Date");
