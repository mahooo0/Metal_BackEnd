import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthMethod, User } from '@prisma/client'
import { verify } from 'argon2'
import { Request, Response } from 'express'

import { LoginDto } from '@/auth/dto/login.dto'
import { RegisterDto } from '@/auth/dto/register.dto'
import { EmailConfirmationService } from '@/auth/email-confirmation/email-confirmation.service'
import { ProviderService } from '@/auth/provider/provider.service'
import { PrismaService } from '@/prisma/prisma.service'
import { UserService } from '@/user/user.service'

import { TwoFactorService } from './two-factor/two-factor.service'

@Injectable()
export class AuthService {
  public constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly providerService: ProviderService,
    private readonly db: PrismaService,
    @Inject(forwardRef(() => EmailConfirmationService))
    private readonly emailConfirmationService: EmailConfirmationService,
    private readonly twoFactorService: TwoFactorService
  ) {}

  public async register(dto: RegisterDto) {
    const isExists = await this.userService.findByEmail(dto.email)

    if (isExists) {
      throw new ConflictException(
        'User already exists. Use another email or login.'
      )
    }

    const isDev = this.configService.get<string>('NODE_ENV') !== 'production'

    const newUser = await this.userService.create(
      dto.email,
      dto.password,
      dto.name,
      null,
      AuthMethod.CREDENTIALS,
      isDev // Auto-verify on dev
    )

    if (!isDev) {
      await this.emailConfirmationService.sendVerificationToken(newUser)
    }

    return {
      message: isDev
        ? 'User created successfully and auto-verified (dev mode)'
        : 'User created successfully. Please confirm your email. Message was sent to your email'
    }
  }

  public async login(req: Request, dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email)

    if (!user || !user.password) {
      throw new NotFoundException('User not found or password is not set')
    }

    if (user.status === 'BLOCKED') {
      throw new UnauthorizedException('Account is blocked')
    }

    if (user.status === 'DELETED') {
      throw new NotFoundException('User not found')
    }

    const isPasswordValid = await verify(user.password, dto.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password')
    }

    const isDev = this.configService.get<string>('NODE_ENV') !== 'production'

    if (!user.isVerified && !isDev) {
      await this.emailConfirmationService.sendVerificationToken(user)

      throw new UnauthorizedException(
        'Email is not verified. Please confirm your email.'
      )
    }

    if (user.isTwoFactorEnabled && !isDev) {
      if (!dto.token) {
        await this.twoFactorService.sendTwoFactorToken(user.email)

        return {
          message: 'Two-factor authentication required. Token sent to email.'
        }
      }

      await this.twoFactorService.verificationTwoFactorCode(
        user.email,
        dto.token
      )
    }

    if (user.requirePasswordChange) {
      throw new UnauthorizedException(
        'Password change required. Please contact administrator.'
      )
    }

    await this.db.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastIp: this.extractIp(req),
        lastUa: req.headers['user-agent']
      }
    })

    await this.saveSession(req, user)

    return user
  }

  private extractIp(req: Request): string | undefined {
    const forwarded = req.headers['x-forwarded-for']
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim()
    }
    return req.ip || req.socket.remoteAddress
  }

  public async extractProfileFromCode(
    req: Request,
    provider: string,
    code: string
  ) {
    const providerInstance = this.providerService.findByService(provider)

    const profile = await providerInstance.findUserByCode(code)

    const account = await this.db.account.findFirst({
      where: {
        id: profile.id,
        provider: profile.provider
      }
    })

    let user = account?.userId
      ? await this.userService.findById(account.userId)
      : null

    if (user) {
      return this.saveSession(req, user)
    }

    user = await this.userService.create(
      profile.email,
      null,
      profile.name,
      profile.picture,
      AuthMethod[profile.provider.toUpperCase()] as AuthMethod,
      true
    )

    if (!account) {
      await this.db.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: profile.provider,
          accessToken: profile.access_token,
          refreshToken: profile.refresh_token,
          expiresAt: profile.expires_at
        }
      })
    }

    return this.saveSession(req, user)
  }

  public async logout(req: Request, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy(err => {
        if (err) {
          return reject(
            new InternalServerErrorException('Failed to destroy session')
          )
        }

        res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'))

        resolve()
      })
    })
  }

  public async saveSession(req: Request, user: User) {
    return new Promise((resolve, reject) => {
      req.session.userId = user.id

      req.session.save(err => {
        if (err) {
          return reject(
            new InternalServerErrorException('Failed to save session')
          )
        }

        resolve({ user })
      })
    })
  }

  public async getMe(req: Request) {
    const userId = req.session?.userId

    if (!userId) {
      throw new UnauthorizedException('Not authenticated')
    }

    return this.userService.getUserWithPermissions(userId)
  }
}
