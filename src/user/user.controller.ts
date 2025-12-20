import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
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
import { ChangePasswordDto } from '@/user/dto/change-password.dto'
import { UserDto } from '@/user/dto/user.dto'
import { UserService } from '@/user/user.service'

@ApiTags('users')
@ApiCookieAuth()
@Controller('users')
@Authorization()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns current user profile' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  public async findProfile(@Authorized('id') userId: string) {
    return this.userService.findById(userId)
  }

  @Get('profile/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({ summary: 'Get user profile by ID' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async findProfileById(@Param('id') id: string) {
    return this.userService.findById(id)
  }

  @Put('profile/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.USERS_UPDATE)
  @ApiOperation({ summary: 'Update user profile by ID' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully'
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async updateProfile(@Param('id') id: string, @Body() dto: UserDto) {
    return this.userService.updateProfile(id, dto)
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  public async updateProfileUser(
    @Authorized('id') id: string,
    @Body() dto: UserDto
  ) {
    return this.userService.updateProfile(id, dto)
  }

  @Put('password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password for current user' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid current password or password reused'
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  public async changePassword(
    @Authorized('id') id: string,
    @Body() dto: ChangePasswordDto
  ) {
    return this.userService.changePassword(id, dto)
  }
}
