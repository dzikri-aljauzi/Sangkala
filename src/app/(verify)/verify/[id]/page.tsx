import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import VerifyView from "@/components/certificate/VerifyView";

// ─── Metadata ───────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const certificate = await prisma.certificate.findFirst({
    where: { OR: [{ id }, { verifyHash: id }] },
  });

  if (certificate) {
    return {
      title: `Verifikasi Sertifikat - ${certificate.certCode} | Sangkala`,
      description: `Verifikasi resmi sertifikat untuk ${certificate.recipientName} - ${certificate.programName}`,
      robots: { index: false, follow: false },
    };
  }

  return { title: "Tidak Ditemukan | Sangkala" };
}

// ─── Page Component ─────────────────────────────────────────────────────────
export default async function VerifySignaturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const certificate = await prisma.certificate.findFirst({
    where: { OR: [{ id }, { verifyHash: id }] },
    include: { participants: { orderBy: { name: "asc" } } },
  });

  if (!certificate) {
    notFound();
  }

  const issuedLabel = new Date(certificate.issuedDate).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <VerifyView
      data={{
        programName: certificate.programName,
        recipientName: certificate.recipientName,
        recipientLabel: certificate.type === "INSTANSI" ? "Nama Instansi" : "Nama Penerima",
        issuedLabel,
        description: certificate.description,
        certCode: certificate.certCode,
        maturityLevel: certificate.maturityLevel,
        verifyHash: certificate.verifyHash,
        participants: certificate.type === "INSTANSI" ? certificate.participants : undefined,
      }}
    />
  );
}
