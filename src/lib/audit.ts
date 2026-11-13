import { AuditLog } from "@/models/AuditLog";
import type { SessionPayload } from "@/lib/auth";

export async function logAudit(params: {
  actor: SessionPayload;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
}) {
  try {
    await AuditLog.create({
      actorId: params.actor.userId,
      actorEmail: params.actor.email,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      details: params.details ?? "",
    });
  } catch {
    /* non-blocking audit log */
  }
}

