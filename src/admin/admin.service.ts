import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { UserStatus } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import { AddCommentDto } from './dto/add-comment.dto'
import { AddPhoneDto } from './dto/add-phone.dto'
import { ExportUsersQueryDto } from './dto/export-users.dto'
import { GetUsersQueryDto } from './dto/get-users.dto'

@Injectable()
export class AdminService {
  constructor(private readonly db: PrismaService) {}

  async getAllUsers(query: GetUsersQueryDto) {
    const { search, page = 1, limit = 20 } = query
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { displayName: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {}

    const [users, total] = await Promise.all([
      this.db.user.findMany({
        where,
        include: {
          roles: {
            include: {
              role: true
            }
          },
          comments: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  displayName: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.db.user.count({ where })
    ])

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async addComment(userId: string, adminId: string, dto: AddCommentDto) {
    const user = await this.db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const comment = await this.db.userComment.create({
      data: {
        userId,
        createdById: adminId,
        text: dto.text
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
          }
        }
      }
    })

    return comment
  }

  async addExtraPhone(userId: string, dto: AddPhoneDto) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { id: true, extraPhones: true }
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (user.extraPhones.includes(dto.phone)) {
      throw new BadRequestException('Phone number already exists')
    }

    const updatedUser = await this.db.user.update({
      where: { id: userId },
      data: {
        extraPhones: {
          push: dto.phone
        }
      },
      select: {
        id: true,
        email: true,
        phone: true,
        extraPhones: true,
        firstName: true,
        lastName: true,
        displayName: true
      }
    })

    return updatedUser
  }

  async removeExtraPhone(userId: string, phone: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { id: true, extraPhones: true }
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (!user.extraPhones.includes(phone)) {
      throw new BadRequestException('Phone number not found')
    }

    const updatedUser = await this.db.user.update({
      where: { id: userId },
      data: {
        extraPhones: user.extraPhones.filter(p => p !== phone)
      },
      select: {
        id: true,
        email: true,
        phone: true,
        extraPhones: true,
        firstName: true,
        lastName: true,
        displayName: true
      }
    })

    return updatedUser
  }

  async getUserComments(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const comments = await this.db.userComment.findMany({
      where: { userId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return comments
  }

  async exportAllUsers(query: ExportUsersQueryDto) {
    const where = query.status ? { status: query.status } : {}

    const users = await this.db.user.findMany({
      where,
      include: {
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                system: true,
                permissions: true
              }
            }
          }
        },
        comments: {
          include: {
            createdBy: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                displayName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const total = users.length

    return {
      users,
      total,
      exportedAt: new Date().toISOString(),
      filter: query.status ? { status: query.status } : null
    }
  }

  async deleteUser(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, status: true }
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (user.status === UserStatus.DELETED) {
      throw new BadRequestException('User is already deleted')
    }

    const updatedUser = await this.db.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.DELETED
      },
      select: {
        id: true,
        email: true,
        status: true,
        firstName: true,
        lastName: true,
        displayName: true
      }
    })

    return {
      success: true,
      message: 'User deleted successfully',
      user: updatedUser
    }
  }

  async deleteUserComments(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const result = await this.db.userComment.deleteMany({
      where: { userId }
    })

    return {
      success: true,
      message: `Deleted ${result.count} comment(s)`,
      deletedCount: result.count
    }
  }

  async deleteUserComment(userId: string, commentId: string) {
    const comment = await this.db.userComment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      throw new NotFoundException('Comment not found')
    }

    if (comment.userId !== userId) {
      throw new BadRequestException('Comment does not belong to this user')
    }

    await this.db.userComment.delete({
      where: { id: commentId }
    })

    return {
      success: true,
      message: 'Comment deleted successfully'
    }
  }
}
