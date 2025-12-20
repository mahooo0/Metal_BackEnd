import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class PasswordHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, passwordHash: string) {
    return this.prisma.passwordHistory.create({
      data: {
        userId,
        passwordHash
      }
    })
  }

  async findLastN(userId: string, n: number) {
    return this.prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: n
    })
  }

  async deleteOldEntries(userId: string, keepLast: number) {
    const entries = await this.prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: keepLast
    })

    if (entries.length > 0) {
      await this.prisma.passwordHistory.deleteMany({
        where: {
          id: {
            in: entries.map(e => e.id)
          }
        }
      })
    }
  }
}
