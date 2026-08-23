import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(price: string | null | undefined): string {
  if (!price) return "";
  const trimmed = price.trim();
  if (!trimmed) return "";
  if (/^rp/i.test(trimmed)) {
    return trimmed;
  }
  return `Rp ${trimmed}`;
}

export function formatRupiahInput(value: string): string {
  const numberString = value.replace(/[^0-9]/g, "");
  if (!numberString) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(numberString, 10));
}
