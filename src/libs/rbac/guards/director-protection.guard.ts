import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { TARGET_USER_KEY } from '../decorators'
import { PermissionService } from '../services'

@Injectable()
export class DirectorProtectionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targetUserParam = this.reflector.getAllAndOverride<
      string | undefined
    >(TARGET_USER_KEY, [context.getHandler(), context.getClass()])

    if (!targetUserParam) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const currentUser = request.session?.user
    const targetUserId = request.params[targetUserParam] || request.body?.userId

    if (!currentUser || !targetUserId) {
      return true
    }

    if (currentUser.id === targetUserId) {
      return true
    }

    const isTargetDirector =
      await this.permissionService.isDirector(targetUserId)

    if (!isTargetDirector) {
      return true
    }

    const isCurrentDirector = await this.permissionService.isDirector(
      currentUser.id
    )

    if (!isCurrentDirector) {
      throw new ForbiddenException('Only directors can modify other directors')
    }

    return true
  }
}
