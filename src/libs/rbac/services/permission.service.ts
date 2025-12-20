import { Injectable } from '@nestjs/common'

import { SystemRole } from '../constants'
import { RoleRepository } from '../repositories'

@Injectable()
export class PermissionService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async getUserPermissions(
    userId: string,
    permissionsOverride: string[]
  ): Promise<string[]> {
    const roles = await this.roleRepository.getUserRoles(userId)

    const rolePermissions = roles.flatMap(role => role.permissions)

    const uniquePermissions = new Set([
      ...rolePermissions,
      ...permissionsOverride
    ])

    return Array.from(uniquePermissions)
  }

  hasPermission(userPermissions: string[], required: string): boolean {
    return userPermissions.includes(required)
  }

  hasAnyPermission(userPermissions: string[], required: string[]): boolean {
    return required.some(perm => userPermissions.includes(perm))
  }

  hasAllPermissions(userPermissions: string[], required: string[]): boolean {
    return required.every(perm => userPermissions.includes(perm))
  }

  async isDirector(userId: string): Promise<boolean> {
    const roles = await this.roleRepository.getUserRoles(userId)
    return roles.some(role => role.name === SystemRole.DIRECTOR)
  }

  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const roles = await this.roleRepository.getUserRoles(userId)
    return roles.some(role => role.name === roleName)
  }
}
