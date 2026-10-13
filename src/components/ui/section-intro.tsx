import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionIntroProps {
  /** Label Mono di atas judul, mis. "02 · Layanan". Sogan hanya untuk nomor. */
  eyebrow?: string;
  /** Nomor bagian ("01"). Tampil sogan, sesuai batas pemakaian BRAND.md. */
  number?: string;
  title: ReactNode;
  lead?: ReactNode;
  as?: "h1" | "h2";
  /** Di atas seksi gelap (Petrol 900). */
  onDark?: boolean;
  className?: string;
}

/** Header seksi standar: label, judul serif, lead. Selalu rata kiri. */
export function SectionIntro({
  eyebrow,
  number,
  title,
  lead,
  as: Heading = "h2",
  onDark = false,
  className,
}: SectionIntroProps) {
  return (
    <header className={cn("mb-10 md:mb-12", className)}>
      {(eyebrow || number) && (
        <p className="type-meta mb-4 flex items-center gap-3">
          {number && (
            <span className={onDark ? "text-sogan-200" : "text-sogan-600"}>{number}</span>
          )}
          {eyebrow && (
            <span className={onDark ? "text-petrol-300" : "text-petrol-600"}>{eyebrow}</span>
          )}
        </p>
      )}
      <Heading
        className={cn(
          Heading === "h1" ? "type-h1" : "type-h2",
          "prose-width",
          onDark && "!text-paper"
        )}
      >
        {title}
      </Heading>
      {lead && (
        <p className={cn("type-lead prose-width mt-4", onDark && "!text-petrol-300")}>{lead}</p>
      )}
    </header>
  );
}
