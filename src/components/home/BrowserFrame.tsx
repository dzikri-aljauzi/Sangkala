import Image from "next/image";
import { cn } from "@/lib/utils";

/** Bingkai browser sederhana untuk screenshot produk. */
export function BrowserFrame({ src, alt, url, className, priority }: { src: string; alt: string; url: string; className?: string; priority?: boolean }) {
  return (
    <figure className={cn("overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_30px_80px_-20px_rgba(5,42,46,0.35)]", className)}>
      <div className="flex items-center gap-3 border-b border-stone-200 bg-stone-100 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-stone-300" />
          <span className="size-2.5 rounded-full bg-stone-300" />
          <span className="size-2.5 rounded-full bg-stone-300" />
        </span>
        <span className="flex-1 truncate rounded-md bg-white px-3 py-1 font-mono text-[0.6875rem] text-stone-700">{url}</span>
      </div>
      <Image src={src} alt={alt} width={1600} height={1000} sizes="(min-width: 1024px) 60vw, 100vw" className="h-auto w-full" priority={priority} />
    </figure>
  );
}
