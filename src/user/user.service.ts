import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { type AuthMethod, type UserStatus } from '@prisma/client'
import { hash, verify } from 'argon2'

import {
  AuditAction,
  AuditLogService,
  PasswordHistoryService,
  PermissionService
} from '@/libs/rbac'
import { PrismaService } from '@/prisma/prisma.service'
import { ChangePasswordDto } from '@/user/dto/change-password.dto'
import { UserDto } from '@/user/dto/user.dto'

@Injectable()
export class UserService {
  public constructor(
    private readonly db: PrismaService,
    private readonly permissionService: PermissionService,
    private readonly auditLogService: AuditLogService,
    private readonly passwordHistoryService: PasswordHistoryService
  ) {}

  public async findById(id: string) {
    const user = await this.db.user.findUnique({
      where: { id },
      include: {
        accounts: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  public async findByEmail(email: string) {
    return this.db.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    })
  }

  public async findMany(params: {
    query?: string
    status?: UserStatus
    skip?: number
    take?: number
  }) {
    const where = {
      AND: [
        params.query
          ? {
              OR: [
                {
                  email: {
                    contains: params.query,
                    mode: 'insensitive' as const
                  }
                },
                {
                  firstName: {
                    contains: params.query,
                    mode: 'insensitive' as const
                  }
                },
                {
                  lastName: {
                    contains: params.query,
                    mode: 'insensitive' as const
                  }
                }
              ]
            }
          : {},
        params.status ? { status: params.status } : {}
      ]
    }

    const [users, total] = await Promise.all([
      this.db.user.findMany({
        where,
        include: {
          roles: {
            include: {
              role: true
            }
          }
        },
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' }
      }),
      this.db.user.count({ where })
    ])

    return { users, total }
  }

  public async create(
    email: string,
    password: string | null,
    displayName: string,
    picture: string | null,
    method: AuthMethod,
    isVerified: boolean,
    firstName?: string,
    lastName?: string
  ) {
    const passwordHash = password ? await hash(password) : ''

    const user = await this.db.user.create({
      data: {
        email,
        password: passwordHash,
        displayName: displayName || '',
        picture,
        method,
        isVerified,
        firstName: firstName || '',
        lastName: lastName || '',
        status: 'ACTIVE'
      },
      include: {
        accounts: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    if (password) {
      await this.passwordHistoryService.addToHistory(user.id, passwordHash)
    }

    return user
  }

  public async updateProfile(id: string, dto: UserDto) {
    const user = await this.findById(id)

    return this.db.user.update({
      where: { id: user.id },
      data: {
        email: dto.email,
        displayName: dto.displayName,
        isTwoFactorEnabled: dto.isTwoFactorEnabled,
        firstName: dto.firstName,
        lastName: dto.lastName,
        position: dto.position
      }
    })
  }

  public async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.findById(id)

    if (!user.password) {
      throw new UnauthorizedException('User has no password set')
    }

    const isCurrentPasswordValid = await verify(
      user.password,
      dto.currentPassword
    )

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect')
    }

    const isReused = await this.passwordHistoryService.isPasswordReused(
      id,
      dto.newPassword
    )

    if (isReused) {
      throw new BadRequestException(
        'Cannot reuse a recent password. Please choose a different password.'
      )
    }

    const hashedNewPassword = await hash(dto.newPassword)

    await this.db.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        passwordChangedAt: new Date(),
        requirePasswordChange: false
      }
    })

    await this.passwordHistoryService.addToHistory(id, hashedNewPassword)

    await this.auditLogService.log({
      actorId: id,
      action: AuditAction.USER_PASSWORD_CHANGED,
      targetType: 'user',
      targetId: id
    })

    return { message: 'Password updated successfully' }
  }

  public async getUserWithPermissions(userId: string) {
    const user = await this.findById(userId)

    const permissions = await this.permissionService.getUserPermissions(
      userId,
      user.permissionsOverride
    )

    const roles = user.roles.map(ur => ur.role)

    return {
      ...user,
      roles,
      permissions
    }
  }
}
