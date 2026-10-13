"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-petrol-600 text-white hover:bg-petrol-700",
        secondary:
          "bg-transparent text-stone-900 border border-stone-200 hover:bg-stone-100",
        outline:
          "border border-petrol-600 text-petrol-600 hover:bg-petrol-50",
        ghost:
          "text-petrol-600 hover:bg-petrol-50",
        // Tombol teks (DESIGN.md): untuk "Selengkapnya" di dalam blok.
        text:
          "rounded-none font-semibold text-petrol-600 underline-offset-4 hover:underline",
        // Nama "gold" dipertahankan agar pemakai lama tidak berubah API. Sogan
        // tidak boleh jadi tombol (BRAND.md), jadi tampil sebagai tombol primer.
        gold:
          "bg-petrol-600 text-white hover:bg-petrol-700",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-10 sm:h-11 px-5 sm:px-6 text-sm sm:text-base",
        lg: "h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base",
        xl: "h-12 sm:h-14 px-6 sm:px-10 text-sm sm:text-lg",
      },
    },
    compoundVariants: [
      // Dideklarasikan setelah size supaya menang dari h-* dan px-*.
      { variant: "text", className: "h-auto px-0 sm:h-auto sm:px-0" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonBase extends VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

type ButtonAsButton = ButtonBase & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
/** Dengan `href`, tombol dirender sebagai tautan (<a>), bukan <button> di dalam <a>. */
type ButtonAsLink = ButtonBase & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };
export type ButtonProps = ButtonAsButton | ButtonAsLink;

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  if (props.href !== undefined) {
    const { href, className, variant, size, isLoading, children, ...rest } = props as ButtonAsLink;
    void isLoading;
    return (
      <Link href={href} className={cn(buttonVariants({ variant, size, className }))} {...rest}>
        {children}
      </Link>
    );
  }
  const { className, variant, size, isLoading, children, ...rest } = props as ButtonAsButton;
  return (
    <button
      {...rest}
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={isLoading || rest.disabled}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
