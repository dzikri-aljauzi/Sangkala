"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  variant?: "default" | "dark" | "gradient" | "light";
  container?: boolean;
  padding?: "sm" | "md" | "lg" | "xl";
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, variant = "default", container = true, padding = "lg", children, ...props }, ref) => {
    const variants = {
      default: "bg-white",
      dark: "bg-stone-800 text-white",
      gradient: "bg-stone-50",
      light: "bg-stone-50",
    };

    const paddings = {
      sm: "py-10 sm:py-12",
      md: "py-12 sm:py-16",
      lg: "py-14 sm:py-20 md:py-24",
      xl: "py-16 sm:py-20 md:py-28",
    };

    return (
      <section
        ref={ref}
        className={cn(variants[variant], paddings[padding], className)}
        {...props}
      >
        {container ? (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        ) : (
          children
        )}
      </section>
    );
  }
);

Section.displayName = "Section";

interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  description?: string;
  centered?: boolean;
  light?: boolean;
}

const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, subtitle, description, centered = true, light = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mb-10 sm:mb-12 md:mb-16",
          centered && "text-center",
          className
        )}
        {...props}
      >
        {subtitle && (
          <span className={cn(
            "inline-block text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2 sm:mb-3",
            light ? "text-petrol-400" : "text-petrol-600"
          )}>
            {subtitle}
          </span>
        )}
        <h2 className={cn(
          "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4",
          light ? "text-white" : "text-stone-800"
        )}>
          {title}
        </h2>
        {description && (
          <p className={cn(
            "text-sm sm:text-base md:text-lg max-w-3xl leading-relaxed",
            centered && "mx-auto",
            light ? "text-stone-300" : "text-stone-500"
          )}>
            {description}
          </p>
        )}
      </div>
    );
  }
);

SectionHeader.displayName = "SectionHeader";

export { Section, SectionHeader };
