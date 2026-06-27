-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "certCode" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INSTANSI',
    "verifyHash" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "programName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "maturityLevel" TEXT,
    "issuedDate" DATETIME NOT NULL,
    "qrCodeData" TEXT,
    "pdfPath" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "certificates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "certificate_participants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "certificate_participants_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certCode_key" ON "certificates"("certCode");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_verifyHash_key" ON "certificates"("verifyHash");

-- CreateIndex
CREATE INDEX "certificate_participants_certificateId_idx" ON "certificate_participants"("certificateId");
