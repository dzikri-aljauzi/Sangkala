import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Gaya kontrol form: tinggi 48px, garis stone-200, radius 6px, ring fokus petrol (DESIGN.md). */
export const controlClass =
  "w-full h-12 rounded-lg border border-stone-200 bg-white px-4 text-base text-ink placeholder:text-stone-500 outline-none transition-colors focus-visible:border-petrol-600 focus-visible:ring-2 focus-visible:ring-petrol-600/30";
export const textareaClass = cn(controlClass, "h-auto min-h-32 py-3 resize-y");

/** Label di atas field. Penanda wajib berupa teks, bukan hanya tanda bintang. */
export function Field({
  label,
  htmlFor,
  required,
  requiredText = "(wajib)",
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  requiredText?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-1 font-normal text-stone-700">{requiredText}</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-2 text-sm text-status-danger">
          <span aria-hidden>⚠ </span>
          {error}
        </p>
      )}
    </div>
  );
}
