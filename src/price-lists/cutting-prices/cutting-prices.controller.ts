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

import { CuttingPricesService } from './cutting-prices.service'
import {
  CreateCuttingPriceDto,
  CuttingPriceQueryDto,
  UpdateCuttingPriceDto
} from './dto'

@ApiTags('price-lists')
@ApiCookieAuth()
@Controller('price-lists/cutting')
@Authorization()
export class CuttingPricesController {
  constructor(private readonly cuttingPricesService: CuttingPricesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PRICE_LISTS_CREATE)
  @ApiOperation({ summary: 'Create a new cutting price' })
  @ApiResponse({
    status: 201,
    description: 'Cutting price created successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Material Item not found' })
  async create(@Body() dto: CreateCuttingPriceDto) {
    return this.cuttingPricesService.create(dto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PRICE_LISTS_READ)
  @ApiOperation({
    summary: 'Get all cutting prices with filters and pagination'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of cutting prices'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(@Query() query: CuttingPriceQueryDto) {
    return this.cuttingPricesService.findAll(query)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PRICE_LISTS_READ)
  @ApiOperation({ summary: 'Get cutting price by ID' })
  @ApiParam({ name: 'id', description: 'Cutting Price ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Returns cutting price' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Cutting price not found' })
  async findOne(@Param('id') id: string) {
    return this.cuttingPricesService.findOne(id)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PRICE_LISTS_UPDATE)
  @ApiOperation({ summary: 'Update cutting price' })
  @ApiParam({ name: 'id', description: 'Cutting Price ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Cutting price updated successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({
    status: 404,
    description: 'Cutting price or Material Item not found'
  })
  async update(@Param('id') id: string, @Body() dto: UpdateCuttingPriceDto) {
    return this.cuttingPricesService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PRICE_LISTS_DELETE)
  @ApiOperation({ summary: 'Delete cutting price' })
  @ApiParam({ name: 'id', description: 'Cutting Price ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Cutting price deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Cutting price not found' })
  async remove(@Param('id') id: string) {
    return this.cuttingPricesService.remove(id)
  }
}
