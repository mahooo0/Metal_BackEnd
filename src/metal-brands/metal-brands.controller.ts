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
import { RequirePermissions } from '@/libs/rbac/decorators'
import { PermissionsGuard } from '@/libs/rbac/guards'

import {
  CreateMetalBrandDto,
  MetalBrandQueryDto,
  UpdateMetalBrandDto
} from './dto'
import { MetalBrandsService } from './metal-brands.service'

@ApiTags('metal-brands')
@ApiCookieAuth()
@Controller('metal-brands')
@Authorization()
export class MetalBrandsController {
  constructor(private readonly metalBrandsService: MetalBrandsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.METAL_BRANDS_CREATE)
  @ApiOperation({ summary: 'Create a new metal brand' })
  @ApiResponse({
    status: 201,
    description: 'Metal brand created successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({
    status: 409,
    description: 'Metal brand with this name already exists'
  })
  async create(@Body() dto: CreateMetalBrandDto) {
    return this.metalBrandsService.create(dto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.METAL_BRANDS_READ)
  @ApiOperation({
    summary: 'Get all metal brands',
    description: 'Returns paginated list with search and sorting options'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of metal brands'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(@Query() query: MetalBrandQueryDto) {
    return this.metalBrandsService.findAll(query)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.METAL_BRANDS_READ)
  @ApiOperation({ summary: 'Get metal brand by ID' })
  @ApiParam({ name: 'id', description: 'Metal brand ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Returns metal brand'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Metal brand not found' })
  async findOne(@Param('id') id: string) {
    return this.metalBrandsService.findOne(id)
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.METAL_BRANDS_UPDATE)
  @ApiOperation({ summary: 'Update metal brand' })
  @ApiParam({ name: 'id', description: 'Metal brand ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Metal brand updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Metal brand not found' })
  @ApiResponse({
    status: 409,
    description: 'Metal brand with this name already exists'
  })
  async update(@Param('id') id: string, @Body() dto: UpdateMetalBrandDto) {
    return this.metalBrandsService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.METAL_BRANDS_DELETE)
  @ApiOperation({ summary: 'Delete metal brand' })
  @ApiParam({ name: 'id', description: 'Metal brand ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Metal brand deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Metal brand not found' })
  async remove(@Param('id') id: string) {
    return this.metalBrandsService.remove(id)
  }
}
