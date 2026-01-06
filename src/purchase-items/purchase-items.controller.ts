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
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'

import { Authorization } from '@/auth/decorators/auth.decorator'
import { Permission } from '@/libs/rbac/constants'
import { RequirePermissions } from '@/libs/rbac/decorators'
import { PermissionsGuard } from '@/libs/rbac/guards'

import {
  CreatePurchaseItemDto,
  PurchaseItemQueryDto,
  ReceivePurchaseItemDto,
  UpdatePurchaseItemDto,
  UpdatePurchaseItemStatusDto
} from './dto'
import { PurchaseItemsService } from './purchase-items.service'

@ApiTags('purchase-items')
@ApiCookieAuth()
@Controller('purchases/:purchaseId/items')
@Authorization()
export class PurchaseItemsController {
  constructor(private readonly purchaseItemsService: PurchaseItemsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PURCHASE_ITEMS_CREATE)
  @ApiOperation({ summary: 'Add item to purchase' })
  @ApiParam({ name: 'purchaseId', description: 'Purchase ID (UUID)' })
  @ApiResponse({
    status: 201,
    description: 'Item added to purchase successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or material item not found'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  async create(
    @Param('purchaseId') purchaseId: string,
    @Body() dto: CreatePurchaseItemDto
  ) {
    return this.purchaseItemsService.create(purchaseId, dto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PURCHASE_ITEMS_READ)
  @ApiOperation({ summary: 'Get all items for a purchase' })
  @ApiParam({ name: 'purchaseId', description: 'Purchase ID (UUID)' })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by material name, type or sheet type'
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of purchase items'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  async findAll(
    @Param('purchaseId') purchaseId: string,
    @Query() query: PurchaseItemQueryDto
  ) {
    return this.purchaseItemsService.findAll(purchaseId, query)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PURCHASE_ITEMS_READ)
  @ApiOperation({ summary: 'Get purchase item by ID' })
  @ApiParam({ name: 'purchaseId', description: 'Purchase ID (UUID)' })
  @ApiParam({ name: 'id', description: 'Purchase item ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Returns purchase item'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Purchase or item not found' })
  async findOne(
    @Param('purchaseId') purchaseId: string,
    @Param('id') id: string
  ) {
    return this.purchaseItemsService.findOne(purchaseId, id)
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PURCHASE_ITEMS_UPDATE)
  @ApiOperation({ summary: 'Update purchase item' })
  @ApiParam({ name: 'purchaseId', description: 'Purchase ID (UUID)' })
  @ApiParam({ name: 'id', description: 'Purchase item ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Purchase item updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Purchase or item not found' })
  async update(
    @Param('purchaseId') purchaseId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseItemDto
  ) {
    return this.purchaseItemsService.update(purchaseId, id, dto)
  }

  @Patch(':id/receive')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PURCHASE_ITEMS_RECEIVE)
  @ApiOperation({
    summary: 'Receive quantity for purchase item',
    description:
      'Updates received quantity incrementally. Status auto-updates based on quantity.'
  })
  @ApiParam({ name: 'purchaseId', description: 'Purchase ID (UUID)' })
  @ApiParam({ name: 'id', description: 'Purchase item ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Received quantity updated'
  })
  @ApiResponse({ status: 400, description: 'Would exceed ordered quantity' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Purchase or item not found' })
  async receive(
    @Param('purchaseId') purchaseId: string,
    @Param('id') id: string,
    @Body() dto: ReceivePurchaseItemDto
  ) {
    return this.purchaseItemsService.receive(purchaseId, id, dto)
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PURCHASE_ITEMS_UPDATE_STATUS)
  @ApiOperation({ summary: 'Update purchase item status' })
  @ApiParam({ name: 'purchaseId', description: 'Purchase ID (UUID)' })
  @ApiParam({ name: 'id', description: 'Purchase item ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Purchase item status updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Purchase or item not found' })
  async updateStatus(
    @Param('purchaseId') purchaseId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseItemStatusDto
  ) {
    return this.purchaseItemsService.updateStatus(purchaseId, id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PURCHASE_ITEMS_DELETE)
  @ApiOperation({ summary: 'Delete purchase item' })
  @ApiParam({ name: 'purchaseId', description: 'Purchase ID (UUID)' })
  @ApiParam({ name: 'id', description: 'Purchase item ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Purchase item deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Purchase or item not found' })
  async remove(
    @Param('purchaseId') purchaseId: string,
    @Param('id') id: string
  ) {
    return this.purchaseItemsService.remove(purchaseId, id)
  }
}
