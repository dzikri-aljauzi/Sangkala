"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Kata yang berganti di dalam judul. Semua kata ditumpuk di sel grid yang sama,
 * jadi lebarnya mengikuti kata terpanjang dan tata letak tidak melompat.
 * Pembaca layar hanya membaca kata pertama; reduced motion menghentikan rotasi.
 */
export function RotatingWord({
  words,
  interval = 2600,
  paused = false,
  className,
}: {
  words: string[];
  interval?: number;
  paused?: boolean;
  className?: string;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (paused || words.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [paused, words.length, interval]);

  return (
    <span className={cn("relative inline-grid overflow-hidden align-bottom", className)}>
      <span className="sr-only">{words[0]}</span>
      {words.map((w, n) => (
        <span
          key={w}
          aria-hidden
          className="col-start-1 row-start-1 whitespace-nowrap transition-[transform,opacity] duration-700 [transition-timing-function:cubic-bezier(.2,.7,.2,1)]"
          style={{
            transform: n === i ? "translateY(0)" : n === (i - 1 + words.length) % words.length ? "translateY(-100%)" : "translateY(100%)",
            opacity: n === i ? 1 : 0,
          }}
        >
          {w}
        </span>
      ))}
    </span>
  );
}
