import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Pattern } from "@/components/art/Pattern";
import { RiseText } from "@/components/motion/RiseText";

/** Lebar isi 1240px dengan gutter 20/32/48 (DESIGN.md). */
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto max-w-content px-5 md:px-8 lg:px-12", className)}>{children}</div>;
}

type Tone = "paper" | "stone" | "tint" | "dark";
const tones: Record<Tone, string> = {
  paper: "bg-paper",
  stone: "bg-stone-100",
  tint: "bg-petrol-50",
  dark: "bg-petrol-900 text-paper",
};

/** Seksi halaman. Padding 72px mobile, 112px desktop. Petrol 900 maksimal satu per halaman. */
export function Band({
  tone = "paper",
  size = "lg",
  id,
  className,
  children,
  as: Tag = "section",
  ...rest
}: {
  tone?: Tone;
  size?: "sm" | "lg";
  id?: string;
  className?: string;
  children: ReactNode;
  as?: "section" | "div";
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      id={id}
      className={cn(
        tones[tone],
        size === "lg" ? "py-[72px] md:py-[112px]" : "py-12 md:py-16",
        "scroll-mt-24",
        className
      )}
      {...rest}
    >
      <Container>{children}</Container>
    </Tag>
  );
}

type ArtVariant = "orbits" | "rings" | "grid" | "waves" | "bars" | "arcs";

/**
 * Pembuka halaman dalam: gelap, imersif, dengan ilustrasi generatif yang bergerak
 * pelan di sisi kanan. Header situs transparan di atasnya.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
  crumbs,
  art = { variant: "orbits", seed: 3 },
  aside,
}: {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
  crumbs?: { href: string; label: string }[];
  art?: { variant: ArtVariant; seed: number };
  /** Konten tambahan di bawah judul, mis. statistik atau indeks anchor. */
  aside?: ReactNode;
}) {
  return (
    <section className="pt-header relative isolate overflow-hidden bg-petrol-900 text-paper">
      <div aria-hidden className="absolute inset-y-0 right-0 -z-10 w-full opacity-80 [mask-image:linear-gradient(to_left,black_35%,transparent_95%)] lg:w-[70%]">
        <Pattern variant={art.variant} seed={art.seed} tone="dark" animate />
      </div>
      <Container className="pb-16 pt-14 md:pb-24 md:pt-20">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="fade-in mb-10 text-sm text-petrol-200">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-paper">
                  Beranda
                </Link>
              </li>
              {crumbs.map((c) => (
                <li key={c.href} className="flex items-center gap-2">
                  <span aria-hidden className="text-petrol-400">/</span>
                  <Link href={c.href} className="hover:text-paper">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && (
          <p className="type-meta fade-in mb-6 flex items-center gap-3 text-sogan-200" style={{ ["--d" as string]: "60ms" }}>
            <span aria-hidden className="h-px w-8 bg-sogan-200" />
            {eyebrow}
          </p>
        )}
        <h1 className="type-display max-w-[18ch] !text-paper">
          <RiseText text={title} />
        </h1>
        {lead && (
          <p className="type-lead fade-in mt-8 max-w-[52ch] !text-petrol-200" style={{ ["--d" as string]: "450ms" }}>
            {lead}
          </p>
        )}
        {children && (
          <div className="fade-in mt-10 flex flex-wrap items-center gap-x-6 gap-y-3" style={{ ["--d" as string]: "600ms" }}>
            {children}
          </div>
        )}
        {aside && (
          <div className="fade-in mt-14" style={{ ["--d" as string]: "750ms" }}>
            {aside}
          </div>
        )}
      </Container>
    </section>
  );
}
