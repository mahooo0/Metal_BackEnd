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

import { CounterpartiesService } from './counterparties.service'
import {
  CounterpartyQueryDto,
  CreateContactDto,
  CreateCounterpartyDto,
  CreateDocumentDto,
  ReplaceContactsDto,
  ReplaceDocumentsDto,
  UpdateContactDto,
  UpdateCounterpartyDto
} from './dto'

@ApiTags('counterparties')
@ApiCookieAuth()
@Controller('counterparties')
@Authorization()
export class CounterpartiesController {
  constructor(private readonly counterpartiesService: CounterpartiesService) {}

  // ==================== Counterparty CRUD ====================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.COUNTERPARTIES_CREATE)
  @ApiOperation({ summary: 'Create a new counterparty' })
  @ApiResponse({
    status: 201,
    description: 'Counterparty created successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async create(@Body() dto: CreateCounterpartyDto) {
    return this.counterpartiesService.create(dto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.COUNTERPARTIES_READ)
  @ApiOperation({
    summary: 'Get all counterparties',
    description:
      'Returns paginated list of counterparties with filtering and sorting options'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of counterparties'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(@Query() query: CounterpartyQueryDto) {
    return this.counterpartiesService.findAll(query)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.COUNTERPARTIES_READ)
  @ApiOperation({ summary: 'Get counterparty by ID' })
  @ApiParam({ name: 'id', description: 'Counterparty ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Returns counterparty with contacts and documents'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Counterparty not found' })
  async findOne(@Param('id') id: string) {
    return this.counterpartiesService.findOne(id)
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.COUNTERPARTIES_UPDATE)
  @ApiOperation({
    summary: 'Full update of counterparty',
    description:
      'Replaces the entire counterparty object including contacts and documents'
  })
  @ApiParam({ name: 'id', description: 'Counterparty ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Counterparty updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Counterparty not found' })
  async replace(@Param('id') id: string, @Body() dto: CreateCounterpartyDto) {
    return this.counterpartiesService.replace(id, dto)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.COUNTERPARTIES_UPDATE)
  @ApiOperation({
    summary: 'Partial update of counterparty',
    description: 'Updates only the provided fields'
  })
  @ApiParam({ name: 'id', description: 'Counterparty ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Counterparty updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Counterparty not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateCounterpartyDto) {
    return this.counterpartiesService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.COUNTERPARTIES_DELETE)
  @ApiOperation({ summary: 'Delete counterparty' })
  @ApiParam({ name: 'id', description: 'Counterparty ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Counterparty deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Counterparty not found' })
  async remove(@Param('id') id: string) {
    return this.counterpartiesService.remove(id)
  }

  // ==================== Contacts Management ====================

  @Patch(':id/contacts')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.COUNTERPARTIES_UPDATE)
  @ApiOperation({
    summary: 'Replace all contacts',
    description: 'Replaces the entire contacts array for the counterparty'
  })
  @ApiParam({ name: 'id', description: 'Counterparty ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Contacts replaced successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Counterparty not found' })
  async replaceContacts(
    @Param('id') id: string,
    @Body() dto: ReplaceContactsDto
  ) {
    return this.counterpartiesService.replaceContacts(id, dto)
  }

  @Post(':id/contacts')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.COUNTERPARTIES_UPDATE)
  @ApiOperation({
    summary: 'Add a single contact',
    description: 'Creates and appends a new contact to the counterparty'
  })
  @ApiParam({ name: 'id', description: 'Counterparty ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Contact added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Counterparty not found' })
  async addContact(@Param('id') id: string, @Body() dto: CreateContactDto) {
    return this.counterpartiesService.addContact(id, dto)
  }

  @Patch(':id/contacts/:contactId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.COUNTERPARTIES_UPDATE)
  @ApiOperation({
    summary: 'Update a single contact',
    description: 'Updates only the provided fields (phone/email) of the contact'
  })
  @ApiParam({ name: 'id', description: 'Counterparty ID (UUID)' })
  @ApiParam({ name: 'contactId', description: 'Contact ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Contact updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({
    status: 404,
    description: 'Counterparty or contact not found'
  })
  async updateContact(
    @Param('id') id: string,
    @Param('contactId') contactId: string,
    @Body() dto: UpdateContactDto
  ) {
    return this.counterpartiesService.updateContact(id, contactId, dto)
  }

  @Delete(':id/contacts/:contactId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.COUNTERPARTIES_UPDATE)
  @ApiOperation({ summary: 'Delete a contact' })
  @ApiParam({ name: 'id', description: 'Counterparty ID (UUID)' })
  @ApiParam({ name: 'contactId', description: 'Contact ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Contact deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({
    status: 404,
    description: 'Counterparty or contact not found'
  })
  async removeContact(
    @Param('id') id: string,
    @Param('contactId') contactId: string
  ) {
    return this.counterpartiesService.removeContact(id, contactId)
  }

  // ==================== Documents Management ====================

  @Patch(':id/documents')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.COUNTERPARTIES_UPDATE)
  @ApiOperation({
    summary: 'Replace all documents',
    description: 'Replaces the entire documents array for the counterparty'
  })
  @ApiParam({ name: 'id', description: 'Counterparty ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Documents replaced successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Counterparty not found' })
  async replaceDocuments(
    @Param('id') id: string,
    @Body() dto: ReplaceDocumentsDto
  ) {
    return this.counterpartiesService.replaceDocuments(id, dto)
  }

  @Post(':id/documents')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.COUNTERPARTIES_UPDATE)
  @ApiOperation({
    summary: 'Add a document',
    description: 'Creates and appends a new document to the counterparty'
  })
  @ApiParam({ name: 'id', description: 'Counterparty ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Document added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Counterparty not found' })
  async addDocument(@Param('id') id: string, @Body() dto: CreateDocumentDto) {
    return this.counterpartiesService.addDocument(id, dto)
  }

  @Delete(':id/documents/:documentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.COUNTERPARTIES_UPDATE)
  @ApiOperation({ summary: 'Delete a document' })
  @ApiParam({ name: 'id', description: 'Counterparty ID (UUID)' })
  @ApiParam({ name: 'documentId', description: 'Document ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({
    status: 404,
    description: 'Counterparty or document not found'
  })
  async removeDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string
  ) {
    return this.counterpartiesService.removeDocument(id, documentId)
  }
}
