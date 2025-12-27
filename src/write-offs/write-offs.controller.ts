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

import {
  AddWriteOffItemDto,
  CreateWriteOffDto,
  RejectWriteOffDto,
  UpdateWriteOffDto,
  UpdateWriteOffItemDto,
  WriteOffQueryDto
} from './dto'
import { WriteOffsService } from './write-offs.service'

@ApiTags('write-offs')
@ApiCookieAuth()
@Controller('write-offs')
@Authorization()
export class WriteOffsController {
  constructor(private readonly writeOffsService: WriteOffsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.WRITE_OFFS_CREATE)
  @ApiOperation({
    summary: 'Create a new write-off',
    description:
      'Creates a write-off in DRAFT status. Add items using POST /write-offs/:id/items'
  })
  @ApiResponse({
    status: 201,
    description: 'Write-off created successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Write-off number already exists' })
  async create(@Body() dto: CreateWriteOffDto) {
    return this.writeOffsService.create(dto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.WRITE_OFFS_READ)
  @ApiOperation({ summary: 'Get all write-offs with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of write-offs'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(@Query() query: WriteOffQueryDto) {
    return this.writeOffsService.findAll(query)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.WRITE_OFFS_READ)
  @ApiOperation({ summary: 'Get write-off by ID with all items' })
  @ApiParam({ name: 'id', description: 'Write-off ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Returns write-off with items'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Write-off not found' })
  async findOne(@Param('id') id: string) {
    return this.writeOffsService.findOne(id)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.WRITE_OFFS_UPDATE)
  @ApiOperation({
    summary: 'Update write-off',
    description: 'Can only update DRAFT write-offs'
  })
  @ApiParam({ name: 'id', description: 'Write-off ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Write-off updated successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot update write-off with current status'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Write-off not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateWriteOffDto) {
    return this.writeOffsService.update(id, dto)
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.WRITE_OFFS_UPDATE)
  @ApiOperation({
    summary: 'Add item to write-off',
    description:
      'Add a material to be written off. Can only add to DRAFT write-offs.'
  })
  @ApiParam({ name: 'id', description: 'Write-off ID (UUID)' })
  @ApiResponse({
    status: 201,
    description: 'Item added successfully'
  })
  @ApiResponse({
    status: 400,
    description:
      'Cannot add items to non-DRAFT write-off or insufficient quantity'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Write-off or material not found' })
  async addItem(@Param('id') id: string, @Body() dto: AddWriteOffItemDto) {
    return this.writeOffsService.addItem(id, dto)
  }

  @Patch(':id/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.WRITE_OFFS_UPDATE)
  @ApiOperation({
    summary: 'Update write-off item',
    description:
      'Update quantity, weight, or comment for an item. Can only update DRAFT write-offs.'
  })
  @ApiParam({ name: 'id', description: 'Write-off ID (UUID)' })
  @ApiParam({ name: 'itemId', description: 'Write-off Item ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Item updated successfully'
  })
  @ApiResponse({
    status: 400,
    description:
      'Cannot update items in non-DRAFT write-off or insufficient quantity'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Write-off or item not found' })
  async updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateWriteOffItemDto
  ) {
    return this.writeOffsService.updateItem(id, itemId, dto)
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.WRITE_OFFS_UPDATE)
  @ApiOperation({
    summary: 'Remove item from write-off',
    description:
      'Remove an item from write-off. Can only remove from DRAFT write-offs.'
  })
  @ApiParam({ name: 'id', description: 'Write-off ID (UUID)' })
  @ApiParam({ name: 'itemId', description: 'Write-off Item ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Item removed successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot remove items from non-DRAFT write-off'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Write-off or item not found' })
  async removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.writeOffsService.removeItem(id, itemId)
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.WRITE_OFFS_UPDATE)
  @ApiOperation({
    summary: 'Submit write-off for approval',
    description:
      'Validates all items and submits for approval. Status changes to PENDING.'
  })
  @ApiParam({ name: 'id', description: 'Write-off ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Write-off submitted successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - no items or insufficient quantities'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Write-off not found' })
  async submit(@Param('id') id: string) {
    return this.writeOffsService.submit(id)
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.WRITE_OFFS_APPROVE)
  @ApiOperation({
    summary: 'Approve write-off',
    description:
      'Approves the write-off and decreases material quantities in warehouse.'
  })
  @ApiParam({ name: 'id', description: 'Write-off ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Write-off approved. Material quantities updated.'
  })
  @ApiResponse({
    status: 400,
    description: 'Can only approve PENDING write-offs'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Write-off not found' })
  async approve(@Param('id') id: string) {
    return this.writeOffsService.approve(id)
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.WRITE_OFFS_APPROVE)
  @ApiOperation({
    summary: 'Reject write-off',
    description:
      'Rejects the write-off with a reason. Status returns to DRAFT for editing.'
  })
  @ApiParam({ name: 'id', description: 'Write-off ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Write-off rejected'
  })
  @ApiResponse({
    status: 400,
    description: 'Can only reject PENDING write-offs'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Write-off not found' })
  async reject(@Param('id') id: string, @Body() dto: RejectWriteOffDto) {
    return this.writeOffsService.reject(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.WRITE_OFFS_DELETE)
  @ApiOperation({
    summary: 'Delete write-off',
    description: 'Can only delete DRAFT write-offs.'
  })
  @ApiParam({ name: 'id', description: 'Write-off ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Write-off deleted successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete non-DRAFT write-off'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Write-off not found' })
  async remove(@Param('id') id: string) {
    return this.writeOffsService.remove(id)
  }
}
