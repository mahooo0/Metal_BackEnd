import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'

import {
  ALL_PERMISSIONS,
  ROLE_PERMISSIONS,
  RoleRepository,
  SystemRole
} from '@/libs/rbac'

import type { CreateRoleDto, UpdateRoleDto } from './dto'
import type {
  AllPermissionsResponseDto,
  PermissionCategoryDto,
  SystemRolesMetadataResponseDto
} from './dto'

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  getSystemRolesMetadata(): SystemRolesMetadataResponseDto {
    const roleDescriptions: Record<string, string> = {
      [SystemRole.DIRECTOR]:
        'Full system access with all permissions. Can manage all aspects of the system including roles and users.',
      [SystemRole.ADMIN]:
        'Administrative access to most system features. Cannot modify or assign roles.',
      [SystemRole.TECHNICAL]:
        'Production and technical operations. Manages tasks, production planning, inventory, and technical workflows.',
      [SystemRole.MANAGER]:
        'Sales and customer relations. Handles orders, pricing, quotes, contractors, and pipeline management.',
      [SystemRole.STOREKEEPER]:
        'Warehouse operations. Manages inventory, shipments, and stock movements.',
      [SystemRole.ACCOUNTANT]:
        'Financial operations. Handles finances, invoices, payments, approvals, and reports.'
    }

    const systemRoles = Object.values(SystemRole).map(roleName => ({
      name: roleName,
      description: roleDescriptions[roleName] || 'System role',
      permissions: ROLE_PERMISSIONS[roleName] || [],
      permissionsCount: (ROLE_PERMISSIONS[roleName] || []).length
    }))

    return {
      systemRoles,
      total: systemRoles.length
    }
  }

  getAllPermissions(): AllPermissionsResponseDto {
    const categories: PermissionCategoryDto[] = []
    const categoryMap = new Map<string, string[]>()

    // Group permissions by category
    ALL_PERMISSIONS.forEach(permission => {
      const [category] = permission.split(':')
      if (!categoryMap.has(category)) {
        categoryMap.set(category, [])
      }
      categoryMap.get(category).push(permission)
    })

    // Convert to array with labels
    const categoryLabels: Record<string, string> = {
      users: 'User Management',
      roles: 'Role Management',
      orders: 'Order Management',
      pricing: 'Pricing',
      quote: 'Quotes',
      discount: 'Discounts',
      tasks: 'Task Management',
      inventory: 'Inventory Management',
      products: 'Product Management',
      production: 'Production',
      shipments: 'Shipment Management',
      finance: 'Finance',
      invoice: 'Invoices',
      payment: 'Payments',
      reports: 'Reports',
      analytics: 'Analytics',
      chat: 'Chat',
      settings: 'Settings',
      audit: 'Audit Logs',
      requests: 'Requests',
      contractors: 'Contractor Management',
      plans: 'Planning',
      pipeline: 'Pipeline'
    }

    categoryMap.forEach((permissions, category) => {
      categories.push({
        category,
        label: categoryLabels[category] || category,
        permissions: permissions.sort()
      })
    })

    return {
      total: ALL_PERMISSIONS.length,
      categories: categories.sort((a, b) => a.label.localeCompare(b.label)),
      all: [...ALL_PERMISSIONS].sort()
    }
  }

  async findAll() {
    return this.roleRepository.findAll()
  }

  async findById(id: string) {
    const role = await this.roleRepository.findById(id)

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`)
    }

    return role
  }

  async create(dto: CreateRoleDto) {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new BadRequestException(
        'Role name cannot be empty or contain only whitespace'
      )
    }

    const trimmedName = dto.name.trim()

    const existing = await this.roleRepository.findByName(trimmedName)

    if (existing) {
      throw new ConflictException(
        `Role with name "${trimmedName}" already exists`
      )
    }

    this.validatePermissions(dto.permissions)

    const createdRole = await this.roleRepository.create({
      name: trimmedName,
      permissions: dto.permissions,
      system: false
    })

    return createdRole
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findById(id)

    if (role.system) {
      throw new BadRequestException('Cannot modify system roles')
    }

    if (dto.name) {
      const existing = await this.roleRepository.findByName(dto.name)
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Role with name "${dto.name}" already exists`
        )
      }
    }

    if (dto.permissions) {
      this.validatePermissions(dto.permissions)
    }

    return this.roleRepository.update(id, dto)
  }

  async delete(id: string) {
    const role = await this.findById(id)

    if (role.system) {
      throw new BadRequestException('Cannot delete system roles')
    }

    await this.roleRepository.delete(id)

    return { success: true }
  }

  async assignToUser(userId: string, roleIds: string[]) {
    const roles = await this.roleRepository.findManyByIds(roleIds)

    if (roles.length !== roleIds.length) {
      throw new BadRequestException('Some role IDs are invalid')
    }

    await this.roleRepository.syncUserRoles(userId, roleIds)

    return { success: true }
  }

  private validatePermissions(permissions: string[]): void {
    const validPermissions = new Set<string>(ALL_PERMISSIONS)
    const invalidPermissions = permissions.filter(p => !validPermissions.has(p))

    if (invalidPermissions.length > 0) {
      throw new BadRequestException(
        `Invalid permissions: ${invalidPermissions.join(', ')}`
      )
    }
  }
}
