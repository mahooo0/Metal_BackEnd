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
import { RequirePermissions } from '@/libs/rbac/decorators'
import { PermissionsGuard } from '@/libs/rbac/guards'

import {
  CreatePurchaseDto,
  PurchaseQueryDto,
  UpdatePurchaseDto,
  UpdatePurchaseStatusDto
} from './dto'
import { PurchasesService } from './purchases.service'

@ApiTags('purchases')
@ApiCookieAuth()
@Controller('purchases')
@Authorization()
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PURCHASES_CREATE)
  @ApiOperation({ summary: 'Create a new purchase (without items)' })
  @ApiResponse({
    status: 201,
    description: 'Purchase created successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or supplier not found'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Purchase ID already exists' })
  async create(@Body() dto: CreatePurchaseDto) {
    return this.purchasesService.create(dto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PURCHASES_READ)
  @ApiOperation({ summary: 'Get all purchases with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of purchases'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(@Query() query: PurchaseQueryDto) {
    return this.purchasesService.findAll(query)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PURCHASES_READ)
  @ApiOperation({ summary: 'Get purchase by ID with all items' })
  @ApiParam({ name: 'id', description: 'Purchase ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Returns purchase with items'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  async findOne(@Param('id') id: string) {
    return this.purchasesService.findOne(id)
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PURCHASES_UPDATE)
  @ApiOperation({ summary: 'Update purchase' })
  @ApiParam({ name: 'id', description: 'Purchase ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Purchase updated successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or supplier not found'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  @ApiResponse({ status: 409, description: 'Purchase ID already exists' })
  async update(@Param('id') id: string, @Body() dto: UpdatePurchaseDto) {
    return this.purchasesService.update(id, dto)
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PURCHASES_UPDATE_STATUS)
  @ApiOperation({
    summary: 'Update purchase status',
    description:
      'Cannot change to RECEIVED status. Use POST /purchases/:id/submit instead.'
  })
  @ApiParam({ name: 'id', description: 'Purchase ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Purchase status updated successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status or cannot set RECEIVED'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseStatusDto
  ) {
    return this.purchasesService.updateStatus(id, dto)
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PURCHASES_SUBMIT)
  @ApiOperation({
    summary: 'Submit purchase',
    description:
      'Validates all items are READY, creates Materials from items, and sets status to RECEIVED.'
  })
  @ApiParam({ name: 'id', description: 'Purchase ID (UUID)' })
  @ApiResponse({
    status: 200,
    description:
      'Purchase submitted successfully. Returns purchase and created materials.'
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - not all items are ready'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  async submit(@Param('id') id: string) {
    return this.purchasesService.submit(id)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PURCHASES_DELETE)
  @ApiOperation({ summary: 'Delete purchase' })
  @ApiParam({ name: 'id', description: 'Purchase ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Purchase deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  async remove(@Param('id') id: string) {
    return this.purchasesService.remove(id)
  }
}
