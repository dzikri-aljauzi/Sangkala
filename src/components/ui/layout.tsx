import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

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

/** Pembuka halaman dalam: label Mono, H1 serif, lead, aksi opsional. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-stone-200 bg-paper pb-14 pt-14 md:pb-20 md:pt-20">
      <Container>
        {eyebrow && <p className="type-meta mb-5 text-petrol-600">{eyebrow}</p>}
        <h1 className="type-h1 prose-width">{title}</h1>
        {lead && <p className="type-lead prose-width mt-6">{lead}</p>}
        {children && <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">{children}</div>}
      </Container>
    </section>
  );
}
