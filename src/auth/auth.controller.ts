import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { Request, Response } from 'express'

import { AuthService } from '@/auth/auth.service'
import {
  LoginResponseDto,
  RegisterResponseDto,
  UserResponseDto
} from '@/auth/dto/auth-response.dto'
import { LoginDto } from '@/auth/dto/login.dto'
import { RegisterDto } from '@/auth/dto/register.dto'

import { AuthProviderGuard } from './guards/provider.guard'
import { ProviderService } from './provider/provider.service'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  public constructor(
    private readonly authService: AuthService,
    private readonly providerService: ProviderService,
    private readonly configService: ConfigService
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register new user',
    description:
      'Creates a new user account with email and password. Sends verification email. User must verify email before login.'
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully. Verification email sent.',
    type: RegisterResponseDto
  })
  @ApiResponse({
    status: 400,
    description:
      'Validation failed (weak password, invalid email, passwords do not match)'
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists'
  })
  public async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Get('/oauth/callback/:provider')
  @UseGuards(AuthProviderGuard)
  @ApiOperation({ summary: 'OAuth callback endpoint' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend' })
  public async oauthCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('provider') provider: string,
    @Query('code') code: string
  ) {
    if (!code) {
      throw new BadRequestException(
        'Code is required. Please check the correctness of the entered data.'
      )
    }

    await this.authService.extractProfileFromCode(req, provider, code)

    return res.redirect(
      `${this.configService.getOrThrow<string>('ALLOWED_ORIGIN')}/dashboard/settings`
    )
  }

  @Get('/oauth/connect/:provider')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthProviderGuard)
  @ApiOperation({ summary: 'Get OAuth authorization URL' })
  @ApiResponse({ status: 200, description: 'Returns OAuth URL' })
  public oauth(@Param('provider') provider: string) {
    const providerInstance = this.providerService.findByService(provider)

    return {
      url: providerInstance.getAuthUrl()
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with credentials',
    description:
      'Authenticates user with email and password. Returns user data with roles. Sets session cookie for subsequent requests. Supports 2FA if enabled.'
  })
  @ApiResponse({
    status: 200,
    description:
      'Login successful. Session cookie set. Returns user with roles and permissions.',
    type: LoginResponseDto
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 401,
    description:
      'Invalid credentials, email not verified, account blocked, or password change required'
  })
  public async login(@Req() req: Request, @Body() dto: LoginDto) {
    return this.authService.login(req, dto)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  public async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.logout(req, res)
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Get current user with roles and permissions',
    description:
      "Returns the authenticated user's profile including all assigned roles and aggregated permissions. Requires valid session cookie."
  })
  @ApiResponse({
    status: 200,
    description: 'Returns current user with roles array and permissions array',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated or session expired'
  })
  public async getMe(@Req() req: Request) {
    return this.authService.getMe(req)
  }
}
