import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  href: string;
  title: string;
  summary?: string;
  /** Jenis konten, mis. "Whitepaper". */
  kind?: string;
  /** Tanggal sudah diformat, mis. "12 Mar 2026". */
  date?: string;
  readTime?: string;
  image?: string;
  imageAlt?: string;
  className?: string;
}

/** Kartu insight: teks dulu, tanpa latar dan bayangan. Gambar opsional. */
export function InsightCard({
  href,
  title,
  summary,
  kind,
  date,
  readTime,
  image,
  imageAlt = "",
  className,
}: InsightCardProps) {
  const meta = [kind, date, readTime].filter(Boolean).join(" · ");
  return (
    <article className={cn("group border-t border-stone-200 pt-5", className)}>
      <Link
        href={href}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-petrol-600"
      >
        {image && (
          <div className="relative mb-5 aspect-[3/2] overflow-hidden rounded-lg bg-stone-100">
            <Image src={image} alt={imageAlt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
          </div>
        )}
        {meta && <p className="type-meta mb-3 text-stone-600">{meta}</p>}
        <h3 className="type-card line-clamp-3 transition-colors group-hover:text-petrol-600">{title}</h3>
        {summary && (
          <p className="mt-3 line-clamp-2 text-[0.9375rem] leading-relaxed text-stone-700">{summary}</p>
        )}
      </Link>
    </article>
  );
}
