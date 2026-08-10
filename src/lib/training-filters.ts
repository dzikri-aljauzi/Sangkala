export type TrainingDateFilter = "minggu-ini" | "bulan-ini" | "tahun-ini";

export const TRAINING_DATE_FILTERS: { value: TrainingDateFilter; label: string }[] = [
  { value: "minggu-ini", label: "Minggu Ini" },
  { value: "bulan-ini", label: "Bulan Ini" },
  { value: "tahun-ini", label: "Tahun Ini" },
];

export function isTrainingDateFilter(value: string): value is TrainingDateFilter {
  return value === "minggu-ini" || value === "bulan-ini" || value === "tahun-ini";
}

// Rentang tanggal kalender (bukan rolling window) — dipakai bersama oleh
// API (server) dan halaman list (client) supaya definisi "minggu/bulan/tahun ini" sama persis.
export function getTrainingDateRange(filter: TrainingDateFilter, now: Date = new Date()): { start: Date; end: Date } {
  if (filter === "minggu-ini") {
    const day = now.getDay(); // 0 = Minggu, 1 = Senin, ...
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0, 0);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999);
    return { start, end };
  }

  if (filter === "bulan-ini") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  // tahun-ini
  const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  return { start, end };
}
