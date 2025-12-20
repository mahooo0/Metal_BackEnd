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
  CreateSupplierContactDto,
  CreateSupplierDto,
  SupplierQueryDto,
  UpdateSupplierContactDto,
  UpdateSupplierDto
} from './dto'
import { SuppliersService } from './suppliers.service'

@ApiTags('suppliers')
@ApiCookieAuth()
@Controller('suppliers')
@Authorization()
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  // ==================== Supplier CRUD ====================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.SUPPLIERS_CREATE)
  @ApiOperation({ summary: 'Create a new supplier with contacts' })
  @ApiResponse({
    status: 201,
    description: 'Supplier created successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.SUPPLIERS_READ)
  @ApiOperation({ summary: 'Get all suppliers with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of suppliers'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(@Query() query: SupplierQueryDto) {
    return this.suppliersService.findAll(query)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.SUPPLIERS_READ)
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiParam({ name: 'id', description: 'Supplier ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Returns supplier with contacts'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id)
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.SUPPLIERS_UPDATE)
  @ApiOperation({ summary: 'Update supplier' })
  @ApiParam({ name: 'id', description: 'Supplier ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Supplier updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.SUPPLIERS_DELETE)
  @ApiOperation({ summary: 'Delete supplier' })
  @ApiParam({ name: 'id', description: 'Supplier ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Supplier deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async remove(@Param('id') id: string) {
    return this.suppliersService.remove(id)
  }

  // ==================== Contacts Management ====================

  @Post(':id/contacts')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.SUPPLIERS_UPDATE)
  @ApiOperation({ summary: 'Add contact to supplier' })
  @ApiParam({ name: 'id', description: 'Supplier ID (UUID)' })
  @ApiResponse({
    status: 201,
    description: 'Contact added successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async addContact(
    @Param('id') id: string,
    @Body() dto: CreateSupplierContactDto
  ) {
    return this.suppliersService.addContact(id, dto)
  }

  @Put(':id/contacts/:contactId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.SUPPLIERS_UPDATE)
  @ApiOperation({ summary: 'Update supplier contact' })
  @ApiParam({ name: 'id', description: 'Supplier ID (UUID)' })
  @ApiParam({ name: 'contactId', description: 'Contact ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Contact updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Supplier or contact not found' })
  async updateContact(
    @Param('id') id: string,
    @Param('contactId') contactId: string,
    @Body() dto: UpdateSupplierContactDto
  ) {
    return this.suppliersService.updateContact(id, contactId, dto)
  }

  @Delete(':id/contacts/:contactId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.SUPPLIERS_UPDATE)
  @ApiOperation({ summary: 'Delete supplier contact' })
  @ApiParam({ name: 'id', description: 'Supplier ID (UUID)' })
  @ApiParam({ name: 'contactId', description: 'Contact ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Contact deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Supplier or contact not found' })
  async removeContact(
    @Param('id') id: string,
    @Param('contactId') contactId: string
  ) {
    return this.suppliersService.removeContact(id, contactId)
  }
}
