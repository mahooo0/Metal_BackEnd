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
  CreateMaterialItemDto,
  MaterialItemQueryDto,
  UpdateMaterialItemDto
} from './dto'
import { MaterialItemsService } from './material-items.service'

@ApiTags('material-items')
@ApiCookieAuth()
@Controller('material-items')
@Authorization()
export class MaterialItemsController {
  constructor(private readonly materialItemsService: MaterialItemsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.MATERIAL_ITEMS_CREATE)
  @ApiOperation({ summary: 'Create a new material item' })
  @ApiResponse({
    status: 201,
    description: 'Material item created successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data or metal brand not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async create(@Body() dto: CreateMaterialItemDto) {
    return this.materialItemsService.create(dto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.MATERIAL_ITEMS_READ)
  @ApiOperation({ summary: 'Get all material items with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of material items'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(@Query() query: MaterialItemQueryDto) {
    return this.materialItemsService.findAll(query)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.MATERIAL_ITEMS_READ)
  @ApiOperation({ summary: 'Get material item by ID' })
  @ApiParam({ name: 'id', description: 'Material item ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Returns material item'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Material item not found' })
  async findOne(@Param('id') id: string) {
    return this.materialItemsService.findOne(id)
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.MATERIAL_ITEMS_UPDATE)
  @ApiOperation({ summary: 'Update material item' })
  @ApiParam({ name: 'id', description: 'Material item ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Material item updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data or metal brand not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Material item not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateMaterialItemDto) {
    return this.materialItemsService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.MATERIAL_ITEMS_DELETE)
  @ApiOperation({ summary: 'Delete material item' })
  @ApiParam({ name: 'id', description: 'Material item ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Material item deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Material item not found' })
  async remove(@Param('id') id: string) {
    return this.materialItemsService.remove(id)
  }
}
