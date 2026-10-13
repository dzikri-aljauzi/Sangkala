import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pattern, hashSeed } from "@/components/art/Pattern";

interface InsightCardProps {
  href: string;
  title: string;
  summary?: string;
  kind?: string;
  date?: string;
  readTime?: string;
  image?: string;
  imageAlt?: string;
  /** Kartu besar untuk artikel unggulan. */
  featured?: boolean;
  className?: string;
}

const variants = ["orbits", "waves", "grid", "bars", "arcs", "rings"] as const;

/** Kartu insight dengan sampul: gambar unggahan, atau ilustrasi generatif dari judulnya. */
export function InsightCard({ href, title, summary, kind, date, readTime, image, imageAlt = "", featured, className }: InsightCardProps) {
  const seed = hashSeed(title);
  const variant = variants[seed % variants.length];
  const meta = [date, readTime].filter(Boolean).join(" · ");
  return (
    <article className={cn("group", featured && "lg:grid lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-12", className)}>
      <Link href={href} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-petrol-600">
        <div className={cn("relative overflow-hidden rounded-2xl bg-petrol-900", featured ? "aspect-[16/10]" : "aspect-[4/3]")}>
          <div className="absolute inset-0 transition-transform duration-700 [transition-timing-function:cubic-bezier(.2,.7,.2,1)] group-hover:scale-105">
            {image ? (
              <Image src={image} alt={imageAlt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            ) : (
              <Pattern variant={variant} seed={seed} tone="dark" />
            )}
          </div>
          {kind && (
            <span className="type-meta absolute left-4 top-4 rounded-full bg-paper/95 px-3 py-1.5 !tracking-wider text-petrol-900">{kind}</span>
          )}
          <span className="absolute bottom-4 right-4 grid size-11 translate-y-2 place-items-center rounded-full bg-paper text-petrol-900 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight aria-hidden className="size-5" />
          </span>
        </div>
      </Link>
      <div className={cn(featured ? "mt-6 lg:mt-0" : "mt-5")}>
        {meta && <p className="type-meta mb-3 text-stone-700">{meta}</p>}
        <h3 className={cn(featured ? "type-h2" : "type-card", "line-clamp-3")}>
          <Link href={href} className="link-grow">
            {title}
          </Link>
        </h3>
        {summary && <p className={cn("mt-3 text-[0.9375rem] leading-relaxed text-stone-700", featured ? "line-clamp-4 text-lg" : "line-clamp-2")}>{summary}</p>}
      </div>
    </article>
  );
}
