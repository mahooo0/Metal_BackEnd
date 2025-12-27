import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import type { Request } from 'express'

import { Authorization } from '@/auth/decorators/auth.decorator'
import { Permission, PermissionsGuard, RequirePermissions } from '@/libs/rbac'

import type { AssignRolesDto, CreateRoleDto, UpdateRoleDto } from './dto'
import {
  AllPermissionsResponseDto,
  MessageResponseDto,
  RoleResponseDto,
  SystemRolesMetadataResponseDto
} from './dto'
import { RoleService } from './role.service'

@ApiTags('roles')
@ApiCookieAuth()
@Controller('roles')
@Authorization()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('system-roles')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ROLES_READ)
  @ApiOperation({
    summary: 'Get system roles metadata',
    description:
      'Returns metadata for all system roles (Director, Admin, Technical Specialist, Sales Manager, Storekeeper, Accountant) including their descriptions and default permissions. Used by frontend to display role information and help users understand what each role does. Requires roles:read permission.'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all system roles with descriptions and permissions',
    type: SystemRolesMetadataResponseDto
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions (requires roles:read)'
  })
  getSystemRolesMetadata() {
    return this.roleService.getSystemRolesMetadata()
  }

  @Get('permissions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ROLES_READ)
  @ApiOperation({
    summary: 'Get all available permissions',
    description:
      'Returns a complete list of all permissions in the system, grouped by category. Used by frontend to display available permissions when creating/editing roles. Requires roles:read permission.'
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns all permissions grouped by category with human-readable labels',
    type: AllPermissionsResponseDto
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions (requires roles:read)'
  })
  getPermissions() {
    return this.roleService.getAllPermissions()
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ROLES_READ)
  @ApiOperation({
    summary: 'Get all roles',
    description:
      'Retrieves all roles in the system including system roles (Director, Admin, etc.) and custom roles. Requires roles:read permission.'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns array of all roles with their permissions',
    type: [RoleResponseDto]
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions (requires roles:read)'
  })
  async findAll() {
    return this.roleService.findAll()
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ROLES_READ)
  @ApiOperation({
    summary: 'Get role by ID',
    description:
      'Retrieves a specific role by its UUID. Returns all role details including permissions. Requires roles:read permission.'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns role details with permissions array',
    type: RoleResponseDto
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions (requires roles:read)'
  })
  @ApiResponse({ status: 404, description: 'Role with specified ID not found' })
  async findOne(@Param('id') id: string) {
    return this.roleService.findById(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ROLES_CREATE)
  @ApiOperation({
    summary: 'Create new role',
    description:
      'Creates a new custom role with specified permissions. System roles cannot be created via API. Requires roles:create permission.'
  })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully with assigned permissions',
    type: RoleResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid permissions provided or validation failed'
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions (requires roles:create)'
  })
  @ApiResponse({
    status: 409,
    description: 'Role with this name already exists'
  })
  async create(@Req() req: Request, @Body() dto: CreateRoleDto) {
    // WORKAROUND: Use req.body directly as DTO transformation has issues
    const actualDto: CreateRoleDto = {
      name: req.body?.name,
      permissions: req.body?.permissions
    }

    return this.roleService.create(actualDto)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ROLES_UPDATE)
  @ApiOperation({
    summary: 'Update role',
    description:
      "Updates an existing role's name or permissions. System roles (Director, Admin, etc.) cannot be modified. Requires roles:update permission."
  })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully with new data',
    type: RoleResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot modify system roles or invalid permissions provided'
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions (requires roles:update)'
  })
  @ApiResponse({ status: 404, description: 'Role with specified ID not found' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto
  ) {
    // WORKAROUND: Use req.body directly as DTO transformation has issues
    const actualDto: UpdateRoleDto = {
      name: req.body?.name,
      permissions: req.body?.permissions
    }

    return this.roleService.update(id, actualDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ROLES_DELETE)
  @ApiOperation({
    summary: 'Delete role',
    description:
      'Permanently deletes a role. System roles cannot be deleted. Users assigned to this role will lose these permissions. Requires roles:delete permission.'
  })
  @ApiResponse({
    status: 200,
    description: 'Role deleted successfully',
    type: MessageResponseDto
  })
  @ApiResponse({ status: 400, description: 'Cannot delete system roles' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions (requires roles:delete)'
  })
  @ApiResponse({ status: 404, description: 'Role with specified ID not found' })
  async delete(@Param('id') id: string) {
    return this.roleService.delete(id)
  }

  @Post('assign/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ROLES_ASSIGN)
  @ApiOperation({
    summary: 'Assign roles to user',
    description:
      'Assigns one or more roles to a user. This replaces all existing role assignments for the user. Requires roles:assign permission.'
  })
  @ApiResponse({
    status: 200,
    description: 'Roles assigned successfully to user',
    type: MessageResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid role IDs provided or role does not exist'
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions (requires roles:assign)'
  })
  @ApiResponse({ status: 404, description: 'User with specified ID not found' })
  async assignToUser(
    @Param('userId') userId: string,
    @Body() dto: AssignRolesDto
  ) {
    return this.roleService.assignToUser(userId, dto.roleIds)
  }
}
