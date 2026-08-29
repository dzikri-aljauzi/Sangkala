import { prisma } from "@/lib/prisma";

export type AuditEntityType = "TRAINING" | "PAYMENT_SETTING" | "USER" | "REGISTRANT";
export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "STATUS_CHANGE"
  | "PASSWORD_RESET"
  | "DELETE"
  | "REVIEW_PAYMENT";

export interface FieldChange {
  old: unknown;
  new: unknown;
}

export type ChangesDiff = Record<string, FieldChange>;

export interface RecordAuditLogParams {
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  summary: string;
  changes?: ChangesDiff | null;
  userId: string;
}

/**
 * Mencatat riwayat perubahan (Audit Log) ke database.
 */
export async function recordAuditLog({
  entityType,
  entityId,
  action,
  summary,
  changes,
  userId,
}: RecordAuditLogParams): Promise<void> {
  try {
    const changesJson = changes && Object.keys(changes).length > 0 ? JSON.stringify(changes) : null;

    await prisma.auditLog.create({
      data: {
        entityType,
        entityId,
        action,
        summary,
        changes: changesJson,
        userId,
      },
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
  }
}

/**
 * Helper untuk membandingkan dua objek dan menghasilkan diff perubahan field.
 */
export function computeChangesDiff<T extends Record<string, unknown>>(
  oldData: T,
  newData: Partial<T>,
  ignoredKeys: (keyof T)[] = ["updatedAt", "createdAt", "password"]
): ChangesDiff {
  const diff: ChangesDiff = {};

  for (const key of Object.keys(newData) as (keyof T)[]) {
    if (ignoredKeys.includes(key)) continue;

    const oldVal = oldData[key];
    const newVal = newData[key];

    if (newVal !== undefined && oldVal !== newVal) {
      // Normalisasi date comparison jika berupa Date object atau ISO string
      if (oldVal instanceof Date && newVal instanceof Date) {
        if (oldVal.getTime() === newVal.getTime()) continue;
      }

      diff[String(key)] = {
        old: oldVal ?? null,
        new: newVal ?? null,
      };
    }
  }

  return diff;
}
