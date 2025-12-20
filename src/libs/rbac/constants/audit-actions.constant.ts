export const AuditAction = {
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_LOGIN_FAILED: 'user:login_failed',
  USER_CREATED: 'user:created',
  USER_UPDATED: 'user:updated',
  USER_DELETED: 'user:deleted',
  USER_BLOCKED: 'user:blocked',
  USER_UNBLOCKED: 'user:unblocked',
  USER_PASSWORD_CHANGED: 'user:password_changed',
  USER_PASSWORD_RESET_REQUESTED: 'user:password_reset_requested',
  USER_PASSWORD_RESET_COMPLETED: 'user:password_reset_completed',
  USER_PASSWORD_FORCE_RESET: 'user:password_force_reset',
  USER_INVITED: 'user:invited',

  ROLE_ASSIGNED: 'role:assigned',
  ROLE_REMOVED: 'role:removed',
  ROLE_CREATED: 'role:created',
  ROLE_UPDATED: 'role:updated',
  ROLE_DELETED: 'role:deleted',

  PERMISSION_OVERRIDE_ADDED: 'permission:override_added',
  PERMISSION_OVERRIDE_REMOVED: 'permission:override_removed',

  TWO_FACTOR_ENABLED: '2fa:enabled',
  TWO_FACTOR_DISABLED: '2fa:disabled',
  TWO_FACTOR_VERIFIED: '2fa:verified',
  TWO_FACTOR_FAILED: '2fa:failed',

  EMAIL_VERIFIED: 'email:verified',

  SESSION_REVOKED: 'session:revoked',
  ALL_SESSIONS_REVOKED: 'session:all_revoked'
} as const

export type AuditActionValue = (typeof AuditAction)[keyof typeof AuditAction]
