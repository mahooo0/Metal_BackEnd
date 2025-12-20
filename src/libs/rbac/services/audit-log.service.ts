import { Injectable } from '@nestjs/common'
import type { Request } from 'express'

import type { AuditActionValue } from '../constants'
import type { IAuditLogCreate } from '../interfaces'
import { AuditLogRepository } from '../repositories'

@Injectable()
export class AuditLogService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async log(data: IAuditLogCreate) {
    return this.auditLogRepository.create(data)
  }

  async logFromRequest(
    req: Request,
    action: AuditActionValue,
    options: {
      actorId?: string
      targetType?: string
      targetId?: string
      meta?: Record<string, unknown>
      success?: boolean
      errorCode?: string
    } = {}
  ) {
    const ip = this.extractIp(req)
    const ua = req.headers['user-agent']

    return this.log({
      actorId: options.actorId,
      action,
      targetType: options.targetType,
      targetId: options.targetId,
      meta: options.meta,
      ip,
      ua,
      success: options.success ?? true,
      errorCode: options.errorCode
    })
  }

  async getUserAuditLogs(userId: string, skip = 0, take = 50) {
    return this.auditLogRepository.findMany({
      actorId: userId,
      skip,
      take
    })
  }

  async getTargetAuditLogs(
    targetType: string,
    targetId: string,
    skip = 0,
    take = 50
  ) {
    return this.auditLogRepository.findMany({
      targetType,
      targetId,
      skip,
      take
    })
  }

  async getActionAuditLogs(action: string, skip = 0, take = 50) {
    return this.auditLogRepository.findMany({
      action,
      skip,
      take
    })
  }

  private extractIp(req: Request): string | undefined {
    const forwarded = req.headers['x-forwarded-for']
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim()
    }
    return req.ip || req.socket.remoteAddress
  }
}
