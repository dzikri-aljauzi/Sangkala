export interface CertificationHolder {
  id: string;
  bsmrId: string;
  name: string;
  institution: string;
  level: string;
  certificationName: string;
  email: string;
  examDate: string;
  expiryDate: string;
  refreshment1Date: string;
  refreshment2Date: string;
  refreshment1CompletedAt: string | null;
  refreshment2CompletedAt: string | null;
  recertCompletedAt: string | null;
  refreshment1ReminderSentAt: string | null;
  refreshment2ReminderSentAt: string | null;
  recertReminderSentAt: string | null;
  createdAt: string;
}

export type CertificationCheckpoint = "refreshment1" | "refreshment2" | "recert";

export type CertificationStatus =
  | "AKTIF"
  | "MENDEKATI_REFRESHMENT"
  | "MENDEKATI_KADALUARSA"
  | "KADALUARSA";

export interface CertificationHolderWithStatus extends CertificationHolder {
  status: CertificationStatus;
}
