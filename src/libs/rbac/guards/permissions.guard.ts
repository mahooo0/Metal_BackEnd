import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { PERMISSIONS_KEY } from '../decorators'
import { PermissionService } from '../services'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      string[] | undefined
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()])

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) {
      throw new ForbiddenException('User not authenticated')
    }

    // Directors bypass all permission checks
    const isDirector = await this.permissionService.isDirector(user.id)
    if (isDirector) {
      return true
    }

    const userPermissions = await this.permissionService.getUserPermissions(
      user.id,
      user.permissionsOverride || []
    )

    const hasPermission = this.permissionService.hasAllPermissions(
      userPermissions,
      requiredPermissions
    )

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have sufficient permissions to perform this action'
      )
    }

    return true
  }
}
