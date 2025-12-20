import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/prisma/prisma.service'

import type { IAuditLogCreate } from '../interfaces'

@Injectable()
export class AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: IAuditLogCreate) {
    return this.prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        meta: data.meta ? (data.meta as any) : undefined,
        ip: data.ip,
        ua: data.ua,
        success: data.success ?? true,
        errorCode: data.errorCode
      }
    })
  }

  async findMany(params: {
    actorId?: string
    action?: string
    targetType?: string
    targetId?: string
    skip?: number
    take?: number
  }) {
    return this.prisma.auditLog.findMany({
      where: {
        actorId: params.actorId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId
      },
      orderBy: { createdAt: 'desc' },
      skip: params.skip,
      take: params.take,
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        target: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })
  }

  async count(params: {
    actorId?: string
    action?: string
    targetType?: string
    targetId?: string
  }) {
    return this.prisma.auditLog.count({
      where: {
        actorId: params.actorId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId
      }
    })
  }
}
