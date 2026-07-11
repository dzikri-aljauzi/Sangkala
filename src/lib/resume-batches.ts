import { prisma } from "@/lib/prisma";

export async function ensureLegacyResumeBatch(assessmentId: string) {
  return prisma.resumeBatch.upsert({
    where: {
      assessmentId_name: {
        assessmentId,
        name: "Batch Lama",
      },
    },
    update: {},
    create: {
      assessmentId,
      name: "Batch Lama",
    },
  });
}

export async function assignLegacyResumesToBatch(assessmentId: string) {
  const legacyBatch = await ensureLegacyResumeBatch(assessmentId);

  await prisma.resume.updateMany({
    where: {
      assessmentId,
      resumeBatchId: null,
    },
    data: {
      resumeBatchId: legacyBatch.id,
    },
  });

  return legacyBatch;
}
