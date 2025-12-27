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
  CreateMaterialDto,
  MaterialQueryDto,
  UpdateMaterialDto,
  UpdateMaterialStatusDto
} from './dto'
import { MaterialsService } from './materials.service'

@ApiTags('materials')
@ApiCookieAuth()
@Controller('materials')
@Authorization()
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.MATERIALS_CREATE)
  @ApiOperation({ summary: 'Create a new material' })
  @ApiResponse({
    status: 201,
    description: 'Material created successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or material item not found'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async create(@Body() dto: CreateMaterialDto) {
    return this.materialsService.create(dto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.MATERIALS_READ)
  @ApiOperation({ summary: 'Get all materials with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of materials'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(@Query() query: MaterialQueryDto) {
    return this.materialsService.findAll(query)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.MATERIALS_READ)
  @ApiOperation({ summary: 'Get material by ID' })
  @ApiParam({ name: 'id', description: 'Material ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Returns material'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  async findOne(@Param('id') id: string) {
    return this.materialsService.findOne(id)
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.MATERIALS_UPDATE)
  @ApiOperation({ summary: 'Update material' })
  @ApiParam({ name: 'id', description: 'Material ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Material updated successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or material item not found'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.materialsService.update(id, dto)
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.MATERIALS_UPDATE_STATUS)
  @ApiOperation({ summary: 'Update material status' })
  @ApiParam({ name: 'id', description: 'Material ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Material status updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateMaterialStatusDto
  ) {
    return this.materialsService.updateStatus(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.MATERIALS_DELETE)
  @ApiOperation({ summary: 'Delete material' })
  @ApiParam({ name: 'id', description: 'Material ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Material deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  async remove(@Param('id') id: string) {
    return this.materialsService.remove(id)
  }
}
