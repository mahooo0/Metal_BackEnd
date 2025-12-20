import { type AuditActionValue } from '../constants'

export interface IAuditLogCreate {
  actorId?: string
  action: AuditActionValue
  targetType?: string
  targetId?: string
  meta?: Record<string, unknown>
  ip?: string
  ua?: string
  success?: boolean
  errorCode?: string
}

export interface IAuditLog extends IAuditLogCreate {
  id: string
  createdAt: Date
}
