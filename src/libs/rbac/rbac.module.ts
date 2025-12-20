import { Global, Module } from '@nestjs/common'

import { DirectorProtectionGuard, PermissionsGuard } from './guards'
import {
  AuditLogRepository,
  PasswordHistoryRepository,
  RoleRepository
} from './repositories'
import {
  AuditLogService,
  PasswordHistoryService,
  PermissionService
} from './services'

@Global()
@Module({
  providers: [
    RoleRepository,
    AuditLogRepository,
    PasswordHistoryRepository,
    PermissionService,
    AuditLogService,
    PasswordHistoryService,
    PermissionsGuard,
    DirectorProtectionGuard
  ],
  exports: [
    RoleRepository,
    AuditLogRepository,
    PasswordHistoryRepository,
    PermissionService,
    AuditLogService,
    PasswordHistoryService,
    PermissionsGuard,
    DirectorProtectionGuard
  ]
})
export class RbacModule {}
