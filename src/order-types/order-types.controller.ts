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

import { CreateOrderTypeDto, UpdateOrderTypeDto } from './dto'
import { OrderTypesService } from './order-types.service'

@ApiTags('order-types')
@ApiCookieAuth()
@Controller('order-types')
@Authorization()
export class OrderTypesController {
  constructor(private readonly orderTypesService: OrderTypesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ORDER_TYPES_CREATE)
  @ApiOperation({ summary: 'Create a new order type' })
  @ApiResponse({
    status: 201,
    description: 'Order type created successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({
    status: 409,
    description: 'Order type with this name already exists'
  })
  async create(@Body() dto: CreateOrderTypeDto) {
    return this.orderTypesService.create(dto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ORDER_TYPES_READ)
  @ApiOperation({ summary: 'Get all order types' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of all order types'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll() {
    return this.orderTypesService.findAll()
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ORDER_TYPES_READ)
  @ApiOperation({ summary: 'Get order type by ID' })
  @ApiParam({ name: 'id', description: 'Order type ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Returns order type'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Order type not found' })
  async findOne(@Param('id') id: string) {
    return this.orderTypesService.findOne(id)
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ORDER_TYPES_UPDATE)
  @ApiOperation({ summary: 'Update order type' })
  @ApiParam({ name: 'id', description: 'Order type ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Order type updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Order type not found' })
  @ApiResponse({
    status: 409,
    description: 'Order type with this name already exists'
  })
  async update(@Param('id') id: string, @Body() dto: UpdateOrderTypeDto) {
    return this.orderTypesService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ORDER_TYPES_DELETE)
  @ApiOperation({ summary: 'Delete order type' })
  @ApiParam({ name: 'id', description: 'Order type ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Order type deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Order type not found' })
  async remove(@Param('id') id: string) {
    return this.orderTypesService.remove(id)
  }
}
