import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Pita berjalan tanpa henti. Isi digandakan sekali agar putarannya mulus. */
export function Marquee({ children, duration = 40, className }: { children: ReactNode; duration?: number; className?: string }) {
  return (
    <div className={cn("marquee overflow-hidden", className)}>
      <div className="marquee-track" style={{ ["--marquee-dur" as string]: `${duration}s` }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
