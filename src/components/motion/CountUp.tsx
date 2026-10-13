"use client";

import { useEffect, useRef } from "react";

/**
 * Angka yang menghitung naik saat terlihat. HTML server berisi angka akhir,
 * jadi tetap benar tanpa JavaScript. Mendukung awalan/akhiran, mis. "15.000+".
 */
export function CountUp({ value, duration = 1600, className }: { value: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const m = value.match(/^([^\d]*)([\d.,]+)(.*)$/);
    if (!m) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const [, pre, num, post] = m;
    const target = parseInt(num.replace(/[.,]/g, ""), 10);
    const fmt = (n: number) => pre + (num.includes(".") ? n.toLocaleString("id-ID") : String(n)) + post;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = fmt(Math.round(target * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        el.textContent = fmt(0);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
