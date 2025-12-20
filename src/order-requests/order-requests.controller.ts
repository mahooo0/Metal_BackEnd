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
  AddCommentDto,
  CreateOrderRequestDto,
  OrderRequestQueryDto,
  UpdateOrderRequestDto,
  UpdateOrderRequestStatusDto,
  UploadFileDto
} from './dto'
import { OrderRequestsService } from './order-requests.service'

@ApiTags('order-requests')
@ApiCookieAuth()
@Controller('order-requests')
@Authorization()
export class OrderRequestsController {
  constructor(private readonly orderRequestsService: OrderRequestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ORDER_REQUESTS_CREATE)
  @ApiOperation({ summary: 'Create a new order request' })
  @ApiResponse({
    status: 201,
    description: 'Order request created successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'IndexLike already exists' })
  async create(
    @Body() dto: CreateOrderRequestDto,
    @CurrentUser('id') userId: string
  ) {
    return this.orderRequestsService.create(dto, userId)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ORDER_REQUESTS_READ)
  @ApiOperation({
    summary: 'Get all order requests',
    description: 'Returns paginated list with filtering and sorting options'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of order requests'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(@Query() query: OrderRequestQueryDto) {
    return this.orderRequestsService.findAll(query)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ORDER_REQUESTS_READ)
  @ApiOperation({ summary: 'Get order request by ID' })
  @ApiParam({ name: 'id', description: 'Order request ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Returns order request with comments and files'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Order request not found' })
  async findOne(@Param('id') id: string) {
    return this.orderRequestsService.findOne(id)
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ORDER_REQUESTS_UPDATE)
  @ApiOperation({ summary: 'Update order request' })
  @ApiParam({ name: 'id', description: 'Order request ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Order request updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Order request not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateOrderRequestDto) {
    return this.orderRequestsService.update(id, dto)
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ORDER_REQUESTS_UPDATE_STATUS)
  @ApiOperation({ summary: 'Update order request status' })
  @ApiParam({ name: 'id', description: 'Order request ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Order request not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderRequestStatusDto
  ) {
    return this.orderRequestsService.updateStatus(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ORDER_REQUESTS_DELETE)
  @ApiOperation({ summary: 'Delete order request' })
  @ApiParam({ name: 'id', description: 'Order request ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Order request deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Order request not found' })
  async remove(@Param('id') id: string) {
    return this.orderRequestsService.remove(id)
  }

  // ==================== Comments ====================

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ORDER_REQUESTS_ADD_COMMENT)
  @ApiOperation({ summary: 'Add a comment to order request' })
  @ApiParam({ name: 'id', description: 'Order request ID (UUID)' })
  @ApiResponse({
    status: 201,
    description: 'Comment added successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Order request not found' })
  async addComment(
    @Param('id') id: string,
    @Body() dto: AddCommentDto,
    @CurrentUser('id') userId: string
  ) {
    return this.orderRequestsService.addComment(id, dto, userId)
  }

  // ==================== Files ====================

  @Post(':id/files')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ORDER_REQUESTS_UPLOAD_FILE)
  @ApiOperation({
    summary: 'Upload a file to order request',
    description: 'Adds file metadata to the order request'
  })
  @ApiParam({ name: 'id', description: 'Order request ID (UUID)' })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Order request not found' })
  async uploadFile(@Param('id') id: string, @Body() dto: UploadFileDto) {
    return this.orderRequestsService.uploadFile(id, dto)
  }

  @Delete(':id/files/:fileId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ORDER_REQUESTS_UPLOAD_FILE)
  @ApiOperation({ summary: 'Delete a file from order request' })
  @ApiParam({ name: 'id', description: 'Order request ID (UUID)' })
  @ApiParam({ name: 'fileId', description: 'File ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Order request or file not found' })
  async removeFile(@Param('id') id: string, @Param('fileId') fileId: string) {
    return this.orderRequestsService.removeFile(id, fileId)
  }
}
