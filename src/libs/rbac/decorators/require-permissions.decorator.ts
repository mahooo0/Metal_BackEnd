import { SetMetadata } from '@nestjs/common'

import { PermissionValue } from '../constants'

export const PERMISSIONS_KEY = 'permissions'

export const RequirePermissions = (...permissions: PermissionValue[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions)
