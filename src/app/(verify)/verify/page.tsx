"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Field, controlClass } from "@/components/ui/field";

/** Pintu masuk verifikasi: tempel kode dari QR atau PDF sertifikat. */
export default function VerifyLookupPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-stone-200">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-5 md:px-8">
          <Link href="/" aria-label="Sangkala, beranda">
            <Logo className="h-8" />
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl grow px-5 py-14 md:px-8 md:py-24">
        <p className="type-meta mb-5 text-petrol-600">Verifikasi sertifikat</p>
        <h1 className="type-h1 prose-width">Periksa keaslian sertifikat Sangkala</h1>
        <p className="type-lead prose-width mt-6">
          Pindai kode QR pada sertifikat, atau masukkan kode verifikasi yang tercetak di dokumen. Tidak perlu login.
        </p>

        <form
          className="mt-10 max-w-xl space-y-5 border-t border-ink pt-8"
          onSubmit={(e) => {
            e.preventDefault();
            const v = code.trim();
            if (v) router.push(`/verify/${encodeURIComponent(v)}`);
          }}
        >
          <Field label="Kode verifikasi" htmlFor="code" required requiredText="(wajib)">
            <input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoComplete="off"
              spellCheck={false}
              placeholder="mis. 3f9a1c…"
              className={`${controlClass} font-mono`}
            />
          </Field>
          <Button type="submit" size="lg">
            Periksa sertifikat
          </Button>
        </form>
      </main>
    </div>
  );
}
