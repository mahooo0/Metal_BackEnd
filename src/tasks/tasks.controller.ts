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
  Put,
  Query,
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
import { CurrentUser, RequirePermissions } from '@/libs/rbac/decorators'
import { PermissionsGuard } from '@/libs/rbac/guards'

import {
  AddTaskCommentDto,
  CreateTaskDto,
  TaskQueryDto,
  UpdateTaskDatesDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
  UploadTaskFileDto
} from './dto'
import { TasksService } from './tasks.service'

@ApiTags('tasks')
@ApiCookieAuth()
@Controller('tasks')
@Authorization()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASKS_CREATE)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async create(@Body() dto: CreateTaskDto, @CurrentUser('id') userId: string) {
    return this.tasksService.create(dto, userId)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASKS_READ)
  @ApiOperation({
    summary: 'Get all tasks',
    description:
      'Returns paginated list with filtering and sorting options. Supports year/month/day filters.'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of tasks'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(@Query() query: TaskQueryDto) {
    return this.tasksService.findAll(query)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASKS_READ)
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Returns task with comments, files, and timeline'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id)
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASKS_UPDATE)
  @ApiOperation({ summary: 'Update task' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto)
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASKS_UPDATE)
  @ApiOperation({
    summary: 'Update task status',
    description: 'Updates status and automatically adds timeline entry'
  })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto
  ) {
    return this.tasksService.updateStatus(id, dto)
  }

  @Patch(':id/dates')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASKS_UPDATE)
  @ApiOperation({ summary: 'Update task start and end dates' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Dates updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid dates' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async updateDates(@Param('id') id: string, @Body() dto: UpdateTaskDatesDto) {
    return this.tasksService.updateDates(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASKS_DELETE)
  @ApiOperation({ summary: 'Delete task' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Task deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async remove(@Param('id') id: string) {
    return this.tasksService.remove(id)
  }

  // ==================== Comments ====================

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASKS_UPDATE)
  @ApiOperation({ summary: 'Add a comment to task' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)' })
  @ApiResponse({
    status: 201,
    description: 'Comment added successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async addComment(
    @Param('id') id: string,
    @Body() dto: AddTaskCommentDto,
    @CurrentUser('id') userId: string
  ) {
    return this.tasksService.addComment(id, dto, userId)
  }

  // ==================== Files ====================

  @Post(':id/files')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASKS_UPDATE)
  @ApiOperation({
    summary: 'Upload a file to task',
    description: 'Adds file metadata to the task'
  })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)' })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async uploadFile(@Param('id') id: string, @Body() dto: UploadTaskFileDto) {
    return this.tasksService.uploadFile(id, dto)
  }

  @Delete(':id/files/:fileId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASKS_UPDATE)
  @ApiOperation({ summary: 'Delete a file from task' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)' })
  @ApiParam({ name: 'fileId', description: 'File ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Task or file not found' })
  async removeFile(@Param('id') id: string, @Param('fileId') fileId: string) {
    return this.tasksService.removeFile(id, fileId)
  }
}
