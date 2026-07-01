import { db } from "@/lib/db";

export interface AuditLogInput {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string | null;
}

export async function recordAuditLog(input: AuditLogInput): Promise<void> {
  await db.auditLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      oldValue: input.oldValue
        ? JSON.parse(JSON.stringify(input.oldValue))
        : undefined,
      newValue: input.newValue
        ? JSON.parse(JSON.stringify(input.newValue))
        : undefined,
      ipAddress: input.ipAddress ?? null,
    },
  });
}
