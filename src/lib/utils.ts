import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(price: string | null | undefined): string {
  if (!price) return "";
  const trimmed = price.trim();
  if (!trimmed) return "";
  // Sudah berawalan "Rp", atau teks tanpa angka seperti "Gratis".
  if (/^rp/i.test(trimmed) || !/\d/.test(trimmed)) {
    return trimmed;
  }
  return `Rp ${trimmed}`;
}

export function formatRupiahInput(value: string): string {
  const numberString = value.replace(/[^0-9]/g, "");
  if (!numberString) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(numberString, 10));
}

export function formatTrainingDateRange(
  startDateStr: string,
  endDateStr?: string | null,
  locale = "id-ID"
): string {
  if (!startDateStr) return "";
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return "";

  if (!endDateStr) {
    return start.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const end = new Date(endDateStr);
  if (isNaN(end.getTime())) {
    return start.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = start.toLocaleDateString(locale, { month: "long" });
  const endMonth = end.toLocaleDateString(locale, { month: "long" });
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (
    startDay === endDay &&
    start.getMonth() === end.getMonth() &&
    startYear === endYear
  ) {
    return start.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  if (start.getMonth() === end.getMonth() && startYear === endYear) {
    return `${startDay} – ${endDay} ${startMonth} ${startYear}`;
  }

  if (startYear === endYear) {
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
  }

  return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
}

