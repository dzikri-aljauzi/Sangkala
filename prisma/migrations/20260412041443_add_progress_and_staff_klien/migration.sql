-- CreateTable
CREATE TABLE "progresses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityName" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "assessmentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "progresses_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "progresses_assessmentId_idx" ON "progresses"("assessmentId");
