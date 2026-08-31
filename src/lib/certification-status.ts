import { differenceInCalendarDays } from "date-fns";
import type { CertificationHolder, CertificationStatus } from "@/types/certification-holder";

const REMINDER_WINDOW_DAYS = 30;

export function getCertificationStatus(
  holder: CertificationHolder,
  today: Date = new Date()
): CertificationStatus {
  const expiryDate = new Date(holder.expiryDate);
  const refreshment1Date = new Date(holder.refreshment1Date);
  const refreshment2Date = new Date(holder.refreshment2Date);

  const daysUntilExpiry = differenceInCalendarDays(expiryDate, today);
  const daysUntilRefreshment1 = differenceInCalendarDays(refreshment1Date, today);
  const daysUntilRefreshment2 = differenceInCalendarDays(refreshment2Date, today);

  if (daysUntilExpiry < 0 && !holder.recertCompletedAt) {
    return "KADALUARSA";
  }
  if (daysUntilExpiry <= REMINDER_WINDOW_DAYS && !holder.recertCompletedAt) {
    return "MENDEKATI_KADALUARSA";
  }
  // Dibatasi >= 0 (bukan cuma <= 30) supaya checkpoint yang sudah lewat lama tanpa
  // ditandai selesai tidak keliru ke-label "mendekati" -- itu row lawas, biarkan
  // "Tandai Selesai" per-baris di tabel yang menanganinya, bukan badge status utama.
  if (!holder.refreshment2CompletedAt && daysUntilRefreshment2 >= 0 && daysUntilRefreshment2 <= REMINDER_WINDOW_DAYS) {
    return "MENDEKATI_REFRESHMENT";
  }
  if (!holder.refreshment1CompletedAt && daysUntilRefreshment1 >= 0 && daysUntilRefreshment1 <= REMINDER_WINDOW_DAYS) {
    return "MENDEKATI_REFRESHMENT";
  }
  return "AKTIF";
}

export function isReminderEligible(
  checkpointDate: Date,
  reminderSentAt: Date | null,
  completedAt: Date | null,
  today: Date = new Date()
): boolean {
  if (reminderSentAt || completedAt) return false;
  const daysUntil = differenceInCalendarDays(checkpointDate, today);
  return daysUntil >= 0 && daysUntil <= REMINDER_WINDOW_DAYS;
}
