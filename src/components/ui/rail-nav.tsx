"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface RailItem {
  id: string;
  label: string;
}

/**
 * Navigasi dalam-halaman untuk halaman panjang. Desktop: kolom kiri yang
 * menempel. Mobile: baris anchor yang bisa digeser. Item aktif mengikuti scroll.
 */
export function RailNav({ items, className }: { items: RailItem[]; className?: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const targets = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => !!el);
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -60% 0px" }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="Di halaman ini" className={cn("lg:sticky lg:top-24", className)}>
      <p className="type-meta mb-4 hidden text-stone-600 lg:block">Di halaman ini</p>
      <ul className="-mx-5 flex gap-6 overflow-x-auto border-b border-stone-200 px-5 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:border-0 lg:px-0">
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "block py-3 text-sm whitespace-nowrap transition-colors lg:border-l-2 lg:py-1.5 lg:pl-4",
                  "border-b-2 lg:border-b-0",
                  isActive
                    ? "border-petrol-600 font-medium text-ink"
                    : "border-transparent text-stone-600 hover:text-ink"
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
