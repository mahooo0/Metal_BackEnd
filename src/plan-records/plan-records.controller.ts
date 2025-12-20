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
  CreatePlanRecordDto,
  PlanRecordQueryDto,
  UpdatePlanRecordDto,
  UploadPlanFileDto
} from './dto'
import { PlanRecordsService } from './plan-records.service'

@ApiTags('plan-records')
@ApiCookieAuth()
@Controller('plan-records')
@Authorization()
export class PlanRecordsController {
  constructor(private readonly planRecordsService: PlanRecordsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PLANS_CREATE)
  @ApiOperation({ summary: 'Create a new plan record' })
  @ApiResponse({
    status: 201,
    description: 'Plan record created successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data or order not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Plan number already exists' })
  async create(
    @Body() dto: CreatePlanRecordDto,
    @CurrentUser('id') userId: string
  ) {
    return this.planRecordsService.create(dto, userId)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PLANS_READ)
  @ApiOperation({
    summary: 'Get all plan records',
    description: 'Returns paginated list with filtering and sorting options'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of plan records'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(@Query() query: PlanRecordQueryDto) {
    return this.planRecordsService.findAll(query)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PLANS_READ)
  @ApiOperation({ summary: 'Get plan record by ID' })
  @ApiParam({ name: 'id', description: 'Plan record ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Returns plan record with files'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Plan record not found' })
  async findOne(@Param('id') id: string) {
    return this.planRecordsService.findOne(id)
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PLANS_UPDATE)
  @ApiOperation({ summary: 'Update plan record' })
  @ApiParam({ name: 'id', description: 'Plan record ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Plan record updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Plan record not found' })
  async update(@Param('id') id: string, @Body() dto: UpdatePlanRecordDto) {
    return this.planRecordsService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PLANS_DELETE)
  @ApiOperation({ summary: 'Delete plan record' })
  @ApiParam({ name: 'id', description: 'Plan record ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Plan record deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Plan record not found' })
  async remove(@Param('id') id: string) {
    return this.planRecordsService.remove(id)
  }

  // ==================== Files ====================

  @Post(':id/files')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PLANS_UPDATE)
  @ApiOperation({
    summary: 'Upload a file to plan record',
    description: 'Adds file metadata to the plan record'
  })
  @ApiParam({ name: 'id', description: 'Plan record ID (UUID)' })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Plan record not found' })
  async uploadFile(@Param('id') id: string, @Body() dto: UploadPlanFileDto) {
    return this.planRecordsService.uploadFile(id, dto)
  }

  @Delete(':id/files/:fileId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PLANS_UPDATE)
  @ApiOperation({ summary: 'Delete a file from plan record' })
  @ApiParam({ name: 'id', description: 'Plan record ID (UUID)' })
  @ApiParam({ name: 'fileId', description: 'File ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Plan record or file not found' })
  async removeFile(@Param('id') id: string, @Param('fileId') fileId: string) {
    return this.planRecordsService.removeFile(id, fileId)
  }
}
