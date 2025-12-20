import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards
} from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'

import { Authorization } from '@/auth/decorators/auth.decorator'
import { Authorized } from '@/auth/decorators/authorizated.decorator'
import { Permission } from '@/libs/rbac/constants'
import { RequirePermissions } from '@/libs/rbac/decorators'
import { PermissionsGuard } from '@/libs/rbac/guards'

import { AdminService } from './admin.service'
import { AddCommentDto } from './dto/add-comment.dto'
import { AddPhoneDto } from './dto/add-phone.dto'
import { ExportUsersQueryDto } from './dto/export-users.dto'
import { GetUsersQueryDto } from './dto/get-users.dto'

@ApiTags('admin')
@ApiCookieAuth()
@Controller('admin')
@Authorization()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of users' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getAllUsers(@Query() query: GetUsersQueryDto) {
    return this.adminService.getAllUsers(query)
  }

  @Post('users/:id/comments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.USERS_UPDATE)
  @ApiOperation({ summary: 'Add comment to user (Admin only)' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async addComment(
    @Param('id') userId: string,
    @Authorized('id') adminId: string,
    @Body() dto: AddCommentDto
  ) {
    return this.adminService.addComment(userId, adminId, dto)
  }

  @Get('users/:id/comments')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({ summary: 'Get user comments (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns user comments' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserComments(@Param('id') userId: string) {
    return this.adminService.getUserComments(userId)
  }

  @Post('users/:id/phones')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.USERS_UPDATE)
  @ApiOperation({ summary: 'Add extra phone to user (Admin only)' })
  @ApiResponse({ status: 201, description: 'Phone added successfully' })
  @ApiResponse({ status: 400, description: 'Phone number already exists' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async addExtraPhone(@Param('id') userId: string, @Body() dto: AddPhoneDto) {
    return this.adminService.addExtraPhone(userId, dto)
  }

  @Delete('users/:id/phones/:phone')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.USERS_UPDATE)
  @ApiOperation({ summary: 'Remove extra phone from user (Admin only)' })
  @ApiResponse({ status: 200, description: 'Phone removed successfully' })
  @ApiResponse({ status: 400, description: 'Phone number not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async removeExtraPhone(
    @Param('id') userId: string,
    @Param('phone') phone: string
  ) {
    return this.adminService.removeExtraPhone(userId, decodeURIComponent(phone))
  }

  @Get('users/export')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({
    summary: 'Export all users (Admin only)',
    description:
      'Exports complete list of all users without pagination. Supports optional filtering by user status. Returns full user data including roles, permissions, and comments.'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all users with metadata'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async exportAllUsers(@Query() query: ExportUsersQueryDto) {
    return this.adminService.exportAllUsers(query)
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.USERS_DELETE)
  @ApiOperation({
    summary: 'Delete user (Admin only)',
    description:
      'Soft delete user by setting status to DELETED. User data remains in database but user cannot login or access the system.'
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully'
  })
  @ApiResponse({ status: 400, description: 'User already deleted' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId)
  }

  @Delete('users/:id/comments')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.USERS_UPDATE)
  @ApiOperation({
    summary: 'Delete all user comments (Admin only)',
    description:
      'Deletes all comments associated with a specific user. Useful for cleaning up spam or inactive accounts.'
  })
  @ApiResponse({
    status: 200,
    description: 'Comments deleted successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUserComments(@Param('id') userId: string) {
    return this.adminService.deleteUserComments(userId)
  }

  @Delete('users/:id/comments/:commentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.USERS_UPDATE)
  @ApiOperation({
    summary: 'Delete specific user comment (Admin only)',
    description:
      'Deletes a specific comment by ID. Validates that the comment belongs to the specified user.'
  })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Comment does not belong to this user'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async deleteUserComment(
    @Param('id') userId: string,
    @Param('commentId') commentId: string
  ) {
    return this.adminService.deleteUserComment(userId, commentId)
  }
}
