import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import {
  CreatePlanRecordDto,
  PlanRecordQueryDto,
  PlanRecordSortBy,
  UpdatePlanRecordDto,
  UploadPlanFileDto
} from './dto'

@Injectable()
export class PlanRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlanRecordDto, createdById: string) {
    // Check if planNumber is unique
    const existingByPlanNumber = await this.prisma.planRecord.findUnique({
      where: { planNumber: dto.planNumber }
    })

    if (existingByPlanNumber) {
      throw new ConflictException(
        `Plan record with plan number "${dto.planNumber}" already exists`
      )
    }

    // Validate metalBrandId
    const metalBrand = await this.prisma.metalBrand.findUnique({
      where: { id: dto.metalBrandId }
    })

    if (!metalBrand) {
      throw new BadRequestException(
        `Metal brand with ID "${dto.metalBrandId}" not found`
      )
    }

    // Find order by indexLike to get customer
    const orderRequest = await this.prisma.orderRequest.findUnique({
      where: { indexLike: dto.orderNumber },
      include: { counterparty: true }
    })

    if (!orderRequest) {
      throw new BadRequestException(
        `Order request with index "${dto.orderNumber}" not found`
      )
    }

    // Get customer name from counterparty
    const customer = orderRequest.counterparty?.name ?? 'Unknown'

    return this.prisma.planRecord.create({
      data: {
        registrationDate: new Date(dto.registrationDate),
        planNumber: dto.planNumber,
        orderNumber: dto.orderNumber,
        customer,
        metalThickness: dto.metalThickness,
        metalBrandId: dto.metalBrandId,
        createdById
      },
      include: {
        metalBrand: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
          }
        },
        files: true
      }
    })
  }

  async findAll(query: PlanRecordQueryDto) {
    const {
      search,
      dateFrom,
      dateTo,
      counterpartyId,
      createdById,
      metalBrandId,
      sortBy = PlanRecordSortBy.REGISTRATION_DATE,
      sortDirection = 'desc',
      page = 1,
      limit = 20
    } = query

    const where: Prisma.PlanRecordWhereInput = {}

    // General text search
    if (search) {
      where.OR = [
        { planNumber: { contains: search, mode: 'insensitive' } },
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Date range filter for registration date
    if (dateFrom || dateTo) {
      where.registrationDate = {}
      if (dateFrom) {
        where.registrationDate.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.registrationDate.lte = new Date(dateTo)
      }
    }

    // Filter by counterpartyId - need to find orders with this counterparty
    if (counterpartyId) {
      const ordersWithCounterparty = await this.prisma.orderRequest.findMany({
        where: { counterpartyId },
        select: { indexLike: true }
      })
      const orderNumbers = ordersWithCounterparty.map(o => o.indexLike)
      where.orderNumber = { in: orderNumbers }
    }

    if (createdById) {
      where.createdById = createdById
    }

    if (metalBrandId) {
      where.metalBrandId = metalBrandId
    }

    // Build order by
    let orderBy: Prisma.PlanRecordOrderByWithRelationInput

    switch (sortBy) {
      case PlanRecordSortBy.PLAN_NUMBER:
        orderBy = { planNumber: sortDirection }
        break
      case PlanRecordSortBy.ORDER_NUMBER:
        orderBy = { orderNumber: sortDirection }
        break
      case PlanRecordSortBy.CUSTOMER:
        orderBy = { customer: sortDirection }
        break
      case PlanRecordSortBy.CREATED_BY:
        orderBy = { createdBy: { displayName: sortDirection } }
        break
      case PlanRecordSortBy.REGISTRATION_DATE:
      default:
        orderBy = { registrationDate: sortDirection }
    }

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.planRecord.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          metalBrand: true,
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              displayName: true
            }
          },
          _count: {
            select: {
              files: true
            }
          }
        }
      }),
      this.prisma.planRecord.count({ where })
    ])

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async findOne(id: string) {
    const planRecord = await this.prisma.planRecord.findUnique({
      where: { id },
      include: {
        metalBrand: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
          }
        },
        files: {
          orderBy: { uploadedAt: 'desc' }
        }
      }
    })

    if (!planRecord) {
      throw new NotFoundException(`Plan record with ID "${id}" not found`)
    }

    return planRecord
  }

  async update(id: string, dto: UpdatePlanRecordDto) {
    const planRecord = await this.findOne(id)

    // Validate metalBrandId if provided
    if (dto.metalBrandId && dto.metalBrandId !== planRecord.metalBrandId) {
      const metalBrand = await this.prisma.metalBrand.findUnique({
        where: { id: dto.metalBrandId }
      })

      if (!metalBrand) {
        throw new BadRequestException(
          `Metal brand with ID "${dto.metalBrandId}" not found`
        )
      }
    }

    // If orderNumber is updated, validate and update customer
    let customer = planRecord.customer
    if (dto.orderNumber && dto.orderNumber !== planRecord.orderNumber) {
      const orderRequest = await this.prisma.orderRequest.findUnique({
        where: { indexLike: dto.orderNumber },
        include: { counterparty: true }
      })

      if (!orderRequest) {
        throw new BadRequestException(
          `Order request with index "${dto.orderNumber}" not found`
        )
      }

      customer = orderRequest.counterparty?.name ?? 'Unknown'
    }

    return this.prisma.planRecord.update({
      where: { id },
      data: {
        ...dto,
        registrationDate: dto.registrationDate
          ? new Date(dto.registrationDate)
          : undefined,
        customer
      },
      include: {
        metalBrand: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
          }
        },
        files: true
      }
    })
  }

  async remove(id: string) {
    await this.findOne(id)

    await this.prisma.planRecord.delete({ where: { id } })

    return { message: 'Plan record deleted successfully' }
  }

  async uploadFile(id: string, dto: UploadPlanFileDto) {
    await this.findOne(id)

    return this.prisma.planRecordFile.create({
      data: {
        fileName: dto.fileName,
        filePath: dto.filePath,
        fileSize: dto.fileSize,
        planRecordId: id
      }
    })
  }

  async removeFile(id: string, fileId: string) {
    await this.findOne(id)

    const file = await this.prisma.planRecordFile.findFirst({
      where: { id: fileId, planRecordId: id }
    })

    if (!file) {
      throw new NotFoundException(
        `File with ID "${fileId}" not found for this plan record`
      )
    }

    await this.prisma.planRecordFile.delete({ where: { id: fileId } })

    return { message: 'File deleted successfully' }
  }
}
