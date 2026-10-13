import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import ParticipantsSearch from "@/components/certificate/ParticipantsSearch";

export interface VerifyData {
  programName: string;
  recipientName: string;
  recipientLabel?: string;
  issuedLabel: string;
  description?: string;
  certCode?: string;
  maturityLevel?: string | null;
  verifyHash?: string;
  /** Kalimat pernyataan keabsahan. Kalau kosong dibuat dari program dan penerima. */
  statement?: string;
  participants?: { id: string; name: string; createdAt: string | Date }[];
}

/**
 * Halaman verifikasi publik. Hal pertama yang terbaca adalah satu kalimat status
 * dengan ikon dan teks (bukan hanya warna). Dipakai oleh /verify/[id] dan dua
 * halaman statis yang rutenya dipertahankan karena QR cetak mungkin sudah menautkannya.
 */
export default function VerifyView({ data }: { data: VerifyData }) {
  const rows: [string, string | undefined][] = [
    [data.recipientLabel ?? "Nama Penerima", data.recipientName],
    ["Program", data.programName],
    ["Tanggal Terbit", data.issuedLabel],
    ["Tingkat Kematangan", data.maturityLevel ?? undefined],
    ["Ruang Lingkup", data.description],
    ["Kode Sertifikat", data.certCode],
  ];

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-stone-200">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5 md:px-8">
          <Link href="/" aria-label="Sangkala, beranda">
            <Logo className="h-8" />
          </Link>
          <Link href="/verify" className="text-[0.9375rem] text-stone-700 hover:text-petrol-600">
            Verifikasi lain
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl grow px-5 py-12 md:px-8 md:py-16">
        <p className="type-meta mb-5 text-petrol-600">Verifikasi sertifikat</p>
        <div role="status" className="flex items-start gap-4 border-y border-ink py-8">
          <CheckCircle aria-hidden className="mt-1 size-8 shrink-0 text-petrol-600" />
          <div>
            <h1 className="type-h1 !text-[1.75rem] !leading-[2.25rem] md:!text-[2.25rem] md:!leading-[2.75rem]">
              Sertifikat ini sah dan terdaftar di Sangkala
            </h1>
            <p className="prose-width mt-3 text-lg text-stone-700">
              {data.statement ??
                `Sertifikat ${data.programName} untuk ${data.recipientName} ini diterbitkan oleh Sangkala dan tercatat dalam basis data sertifikasi kami.`}
            </p>
          </div>
        </div>

        <dl className="mt-10">
          {rows
            .filter((r): r is [string, string] => !!r[1])
            .map(([k, v]) => (
              <div key={k} className="grid gap-1 border-b border-stone-200 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
                <dt className="type-meta pt-1 text-stone-700">{k}</dt>
                <dd className={k === "Kode Sertifikat" ? "font-mono text-[0.9375rem] text-ink" : "text-[1.0625rem] text-ink"}>{v}</dd>
              </div>
            ))}
        </dl>

        {data.participants && data.participants.length > 0 && <ParticipantsSearch participants={data.participants} />}

        {data.verifyHash && (
          <p className="mt-12 break-all text-sm text-stone-700">
            <span className="type-meta mr-2 text-stone-700">Kode verifikasi</span>
            <span className="font-mono">{data.verifyHash}</span>
          </p>
        )}
        <p className="mt-6 max-w-[68ch] text-sm leading-relaxed text-stone-700">
          Halaman ini hanya untuk keperluan verifikasi keabsahan sertifikasi resmi.
        </p>
      </main>
    </div>
  );
}
