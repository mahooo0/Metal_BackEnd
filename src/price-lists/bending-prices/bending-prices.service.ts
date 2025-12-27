import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import {
  BendingPriceQueryDto,
  BendingPriceSortBy,
  CreateBendingPriceDto,
  UpdateBendingPriceDto
} from './dto'

@Injectable()
export class BendingPricesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBendingPriceDto) {
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

    return this.prisma.bendingPrice.create({
      data: dto,
      include: { materialItem: true }
    })
  }

  async findAll(query: BendingPriceQueryDto) {
    const {
      thickness,
      materialItemId,
      search,
      sortBy = BendingPriceSortBy.THICKNESS,
      sortOrder = 'asc',
      page = 1,
      limit = 20
    } = query

    const where: Prisma.BendingPriceWhereInput = {}

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
      BendingPriceSortBy,
      Prisma.BendingPriceOrderByWithRelationInput
    > = {
      [BendingPriceSortBy.THICKNESS]: { thickness: sortOrder },
      [BendingPriceSortBy.BASE_PRICE]: { basePrice: sortOrder },
      [BendingPriceSortBy.COEFFICIENT]: { coefficient: sortOrder },
      [BendingPriceSortBy.CREATED_AT]: { createdAt: sortOrder }
    }

    const orderBy = orderByMap[sortBy]
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.bendingPrice.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { materialItem: true }
      }),
      this.prisma.bendingPrice.count({ where })
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
    const bendingPrice = await this.prisma.bendingPrice.findUnique({
      where: { id },
      include: { materialItem: true }
    })

    if (!bendingPrice) {
      throw new NotFoundException(`Bending Price with ID "${id}" not found`)
    }

    return bendingPrice
  }

  async update(id: string, dto: UpdateBendingPriceDto) {
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

    return this.prisma.bendingPrice.update({
      where: { id },
      data: dto,
      include: { materialItem: true }
    })
  }

  async remove(id: string) {
    await this.findOne(id)

    await this.prisma.bendingPrice.delete({ where: { id } })

    return { message: 'Bending Price deleted successfully' }
  }
}
