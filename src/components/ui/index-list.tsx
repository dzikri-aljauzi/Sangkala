import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface IndexItem {
  title: string;
  description?: string;
  /** Meta kecil di kanan (mis. tanggal atau format). Plex Mono. */
  meta?: string;
  href?: string;
  /** Kosongkan untuk memakai nomor otomatis 01, 02, ... */
  number?: string;
}

interface IndexListProps {
  items: IndexItem[];
  /** Dua kolom di desktop. Default hanya jika item lebih dari 6. */
  columns?: 1 | 2;
  onDark?: boolean;
  className?: string;
}

function Row({ item, index, onDark }: { item: IndexItem; index: number; onDark: boolean }) {
  const number = item.number ?? String(index + 1).padStart(2, "0");
  const inner: ReactNode = (
    <>
      <span
        className={cn(
          "type-meta w-12 shrink-0 pt-1 !tracking-normal",
          onDark ? "text-sogan-200" : "text-stone-600"
        )}
      >
        {number}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-lg font-medium transition-colors",
            onDark ? "text-paper" : "text-ink",
            item.href && (onDark ? "group-hover:text-petrol-300" : "group-hover:text-petrol-600")
          )}
        >
          {item.title}
        </span>
        {item.description && (
          <span
            className={cn(
              "mt-1 block text-sm leading-relaxed",
              onDark ? "text-petrol-300" : "text-stone-700"
            )}
          >
            {item.description}
          </span>
        )}
      </span>
      {item.meta && (
        <span className="type-meta hidden shrink-0 pt-1.5 text-stone-600 sm:block">{item.meta}</span>
      )}
      {item.href && (
        <ArrowRight
          aria-hidden
          className={cn(
            "mt-1.5 size-5 shrink-0 transition-transform group-hover:translate-x-1",
            onDark ? "text-petrol-300" : "text-stone-600"
          )}
        />
      )}
    </>
  );

  const rowClass = cn(
    "group flex items-start gap-4 border-b py-5 min-h-16",
    onDark ? "border-petrol-800" : "border-stone-200"
  );

  return item.href ? (
    <Link
      href={item.href}
      className={cn(
        rowClass,
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol-600"
      )}
    >
      {inner}
    </Link>
  ) : (
    <div className={rowClass}>{inner}</div>
  );
}

/** Indeks bernomor: pengganti grid kartu untuk layanan, industri, dan program. */
export function IndexList({ items, columns, onDark = false, className }: IndexListProps) {
  const cols = columns ?? (items.length > 6 ? 2 : 1);
  return (
    <ul
      className={cn(
        "border-t",
        onDark ? "border-petrol-300/40" : "border-ink",
        cols === 2 && "md:grid md:grid-cols-2 md:gap-x-12",
        className
      )}
    >
      {items.map((item, i) => (
        <li key={`${item.title}-${i}`} className={cn(cols === 2 && "md:[&:nth-child(2)]:border-t md:[&:nth-child(2)]:border-ink")}>
          <Row item={item} index={i} onDark={onDark} />
        </li>
      ))}
    </ul>
  );
}
