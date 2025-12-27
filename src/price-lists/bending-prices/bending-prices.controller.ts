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

import { BendingPricesService } from './bending-prices.service'
import {
  BendingPriceQueryDto,
  CreateBendingPriceDto,
  UpdateBendingPriceDto
} from './dto'

@ApiTags('price-lists')
@ApiCookieAuth()
@Controller('price-lists/bending')
@Authorization()
export class BendingPricesController {
  constructor(private readonly bendingPricesService: BendingPricesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PRICE_LISTS_CREATE)
  @ApiOperation({ summary: 'Create a new bending price' })
  @ApiResponse({
    status: 201,
    description: 'Bending price created successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Material Item not found' })
  async create(@Body() dto: CreateBendingPriceDto) {
    return this.bendingPricesService.create(dto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PRICE_LISTS_READ)
  @ApiOperation({
    summary: 'Get all bending prices with filters and pagination'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of bending prices'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(@Query() query: BendingPriceQueryDto) {
    return this.bendingPricesService.findAll(query)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PRICE_LISTS_READ)
  @ApiOperation({ summary: 'Get bending price by ID' })
  @ApiParam({ name: 'id', description: 'Bending Price ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Returns bending price' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Bending price not found' })
  async findOne(@Param('id') id: string) {
    return this.bendingPricesService.findOne(id)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PRICE_LISTS_UPDATE)
  @ApiOperation({ summary: 'Update bending price' })
  @ApiParam({ name: 'id', description: 'Bending Price ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Bending price updated successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({
    status: 404,
    description: 'Bending price or Material Item not found'
  })
  async update(@Param('id') id: string, @Body() dto: UpdateBendingPriceDto) {
    return this.bendingPricesService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.PRICE_LISTS_DELETE)
  @ApiOperation({ summary: 'Delete bending price' })
  @ApiParam({ name: 'id', description: 'Bending Price ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Bending price deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Bending price not found' })
  async remove(@Param('id') id: string) {
    return this.bendingPricesService.remove(id)
  }
}
