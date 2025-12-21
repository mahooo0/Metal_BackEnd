import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import {
  CreateCuttingPriceDto,
  CuttingPriceQueryDto,
  CuttingPriceSortBy,
  UpdateCuttingPriceDto
} from './dto'

@Injectable()
export class CuttingPricesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCuttingPriceDto) {
    // Validate materialItemId if provided
    if (dto.materialItemId) {
      const materialItem = await this.prisma.materialItem.findUnique({
        where: { id: dto.materialItemId }
      })
      if (!materialItem) {
        throw new NotFoundException(
          `Material Item with ID "${dto.materialItemId}" not found`
        )
      }
    }

    return this.prisma.cuttingPrice.create({
      data: dto,
      include: { materialItem: true }
    })
  }

  async findAll(query: CuttingPriceQueryDto) {
    const {
      thickness,
      materialItemId,
      search,
      sortBy = CuttingPriceSortBy.THICKNESS,
      sortOrder = 'asc',
      page = 1,
      limit = 20
    } = query

    const where: Prisma.CuttingPriceWhereInput = {}

    if (thickness !== undefined) {
      where.thickness = thickness
    }

    if (materialItemId) {
      where.materialItemId = materialItemId
    }

    if (search) {
      where.description = { contains: search, mode: 'insensitive' }
    }

    const orderByMap: Record<
      CuttingPriceSortBy,
      Prisma.CuttingPriceOrderByWithRelationInput
    > = {
      [CuttingPriceSortBy.THICKNESS]: { thickness: sortOrder },
      [CuttingPriceSortBy.PRICE_PER_METER]: { pricePerMeter: sortOrder },
      [CuttingPriceSortBy.PRICE_PER_HOUR]: { pricePerHour: sortOrder },
      [CuttingPriceSortBy.CREATED_AT]: { createdAt: sortOrder }
    }

    const orderBy = orderByMap[sortBy]
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.cuttingPrice.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { materialItem: true }
      }),
      this.prisma.cuttingPrice.count({ where })
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
    const cuttingPrice = await this.prisma.cuttingPrice.findUnique({
      where: { id },
      include: { materialItem: true }
    })

    if (!cuttingPrice) {
      throw new NotFoundException(`Cutting Price with ID "${id}" not found`)
    }

    return cuttingPrice
  }

  async update(id: string, dto: UpdateCuttingPriceDto) {
    await this.findOne(id)

    // Validate materialItemId if provided
    if (dto.materialItemId) {
      const materialItem = await this.prisma.materialItem.findUnique({
        where: { id: dto.materialItemId }
      })
      if (!materialItem) {
        throw new NotFoundException(
          `Material Item with ID "${dto.materialItemId}" not found`
        )
      }
    }

    return this.prisma.cuttingPrice.update({
      where: { id },
      data: dto,
      include: { materialItem: true }
    })
  }

  async remove(id: string) {
    await this.findOne(id)

    await this.prisma.cuttingPrice.delete({ where: { id } })

    return { message: 'Cutting Price deleted successfully' }
  }
}
