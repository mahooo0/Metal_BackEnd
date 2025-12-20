import { SetMetadata } from '@nestjs/common'

export const TARGET_USER_KEY = 'targetUser'

export const TargetUser = (paramName = 'id') =>
  SetMetadata(TARGET_USER_KEY, paramName)
