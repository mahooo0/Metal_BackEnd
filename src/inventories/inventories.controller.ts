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
import { RequirePermissions } from '@/libs/rbac/decorators'
import { PermissionsGuard } from '@/libs/rbac/guards'

import {
  CreateInventoryDto,
  InventoryQueryDto,
  RejectInventoryDto,
  UpdateInventoryDto,
  UpdateInventoryItemDto
} from './dto'
import { InventoriesService } from './inventories.service'

@ApiTags('inventories')
@ApiCookieAuth()
@Controller('inventories')
@Authorization()
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.INVENTORIES_CREATE)
  @ApiOperation({
    summary: 'Create a new inventory',
    description:
      'Creates an inventory and automatically adds all materials from warehouse with their current quantities.'
  })
  @ApiResponse({
    status: 201,
    description: 'Inventory created successfully with all materials'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Inventory number already exists' })
  async create(@Body() dto: CreateInventoryDto) {
    return this.inventoriesService.create(dto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.INVENTORIES_READ)
  @ApiOperation({ summary: 'Get all inventories with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of inventories'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(@Query() query: InventoryQueryDto) {
    return this.inventoriesService.findAll(query)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.INVENTORIES_READ)
  @ApiOperation({ summary: 'Get inventory by ID with all items' })
  @ApiParam({ name: 'id', description: 'Inventory ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Returns inventory with items'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  async findOne(@Param('id') id: string) {
    return this.inventoriesService.findOne(id)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.INVENTORIES_UPDATE)
  @ApiOperation({
    summary: 'Update inventory',
    description:
      'Can only update inventories with status IN_PROGRESS or REJECTED.'
  })
  @ApiParam({ name: 'id', description: 'Inventory ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Inventory updated successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot update inventory with current status'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateInventoryDto) {
    return this.inventoriesService.update(id, dto)
  }

  @Patch(':id/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.INVENTORIES_UPDATE)
  @ApiOperation({
    summary: 'Update inventory item (set actual quantity)',
    description:
      'Set actual quantity for a material in the inventory. Difference is calculated automatically.'
  })
  @ApiParam({ name: 'id', description: 'Inventory ID (UUID)' })
  @ApiParam({ name: 'itemId', description: 'Inventory Item ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Inventory item updated successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot update item in current inventory status'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Inventory or item not found' })
  async updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateInventoryItemDto
  ) {
    return this.inventoriesService.updateItem(id, itemId, dto)
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.INVENTORIES_UPDATE)
  @ApiOperation({
    summary: 'Submit inventory for approval',
    description:
      'Validates all items have actual quantities and submits for approval. Status changes to PENDING.'
  })
  @ApiParam({ name: 'id', description: 'Inventory ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Inventory submitted successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - not all items have actual quantities'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  async submit(@Param('id') id: string) {
    return this.inventoriesService.submit(id)
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.INVENTORIES_APPROVE)
  @ApiOperation({
    summary: 'Approve inventory',
    description:
      'Approves the inventory and updates all material quantities in warehouse to actual quantities.'
  })
  @ApiParam({ name: 'id', description: 'Inventory ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Inventory approved. Material quantities updated.'
  })
  @ApiResponse({
    status: 400,
    description: 'Can only approve PENDING inventories'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  async approve(@Param('id') id: string) {
    return this.inventoriesService.approve(id)
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.INVENTORIES_APPROVE)
  @ApiOperation({
    summary: 'Reject inventory',
    description:
      'Rejects the inventory with a reason. User can edit and resubmit.'
  })
  @ApiParam({ name: 'id', description: 'Inventory ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Inventory rejected'
  })
  @ApiResponse({
    status: 400,
    description: 'Can only reject PENDING inventories'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  async reject(@Param('id') id: string, @Body() dto: RejectInventoryDto) {
    return this.inventoriesService.reject(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.INVENTORIES_DELETE)
  @ApiOperation({
    summary: 'Delete inventory',
    description: 'Cannot delete approved inventories.'
  })
  @ApiParam({ name: 'id', description: 'Inventory ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Inventory deleted successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete approved inventory'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  async remove(@Param('id') id: string) {
    return this.inventoriesService.remove(id)
  }
}
