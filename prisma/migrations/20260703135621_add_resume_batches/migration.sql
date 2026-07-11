-- CreateTable
CREATE TABLE "resume_batches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "resume_batches_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_resumes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'UMUM',
    "echelonId" TEXT,
    "assessmentId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "resumeBatchId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "resumes_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "resumes_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "resumes_echelonId_fkey" FOREIGN KEY ("echelonId") REFERENCES "echelons" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "resumes_resumeBatchId_fkey" FOREIGN KEY ("resumeBatchId") REFERENCES "resume_batches" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_resumes" ("assessmentId", "category", "createdAt", "echelonId", "fileName", "filePath", "id", "title", "uploadedById") SELECT "assessmentId", "category", "createdAt", "echelonId", "fileName", "filePath", "id", "title", "uploadedById" FROM "resumes";
DROP TABLE "resumes";
ALTER TABLE "new_resumes" RENAME TO "resumes";
CREATE INDEX "resumes_assessmentId_idx" ON "resumes"("assessmentId");
CREATE INDEX "resumes_uploadedById_idx" ON "resumes"("uploadedById");
CREATE INDEX "resumes_echelonId_idx" ON "resumes"("echelonId");
CREATE INDEX "resumes_resumeBatchId_idx" ON "resumes"("resumeBatchId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "resume_batches_assessmentId_idx" ON "resume_batches"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "resume_batches_assessmentId_name_key" ON "resume_batches"("assessmentId", "name");
