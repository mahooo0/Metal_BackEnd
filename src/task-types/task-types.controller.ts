import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards
} from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'

import { Authorization } from '@/auth/decorators/auth.decorator'
import { Permission } from '@/libs/rbac/constants'
import { RequirePermissions } from '@/libs/rbac/decorators'
import { PermissionsGuard } from '@/libs/rbac/guards'

import { CreateTaskTypeDto, UpdateTaskTypeDto } from './dto'
import { TaskTypesService } from './task-types.service'

@ApiTags('task-types')
@ApiCookieAuth()
@Controller('task-types')
@Authorization()
export class TaskTypesController {
  constructor(private readonly taskTypesService: TaskTypesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASK_TYPES_CREATE)
  @ApiOperation({ summary: 'Create a new task type' })
  @ApiResponse({
    status: 201,
    description: 'Task type created successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({
    status: 409,
    description: 'Task type with this name already exists'
  })
  async create(@Body() dto: CreateTaskTypeDto) {
    return this.taskTypesService.create(dto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASK_TYPES_READ)
  @ApiOperation({ summary: 'Get all task types' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of all task types'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll() {
    return this.taskTypesService.findAll()
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASK_TYPES_READ)
  @ApiOperation({ summary: 'Get task type by ID' })
  @ApiParam({ name: 'id', description: 'Task type ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Returns task type'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Task type not found' })
  async findOne(@Param('id') id: string) {
    return this.taskTypesService.findOne(id)
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASK_TYPES_UPDATE)
  @ApiOperation({ summary: 'Update task type' })
  @ApiParam({ name: 'id', description: 'Task type ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Task type updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Task type not found' })
  @ApiResponse({
    status: 409,
    description: 'Task type with this name already exists'
  })
  async update(@Param('id') id: string, @Body() dto: UpdateTaskTypeDto) {
    return this.taskTypesService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASK_TYPES_DELETE)
  @ApiOperation({ summary: 'Delete task type' })
  @ApiParam({ name: 'id', description: 'Task type ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Task type deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Task type not found' })
  async remove(@Param('id') id: string) {
    return this.taskTypesService.remove(id)
  }
}
