import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { MaterialStatus, Prisma } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import {
  CreateMaterialDto,
  MaterialQueryDto,
  MaterialSortBy,
  UpdateMaterialDto,
  UpdateMaterialStatusDto
} from './dto'

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaterialDto) {
    // Validate that the materialItemId exists
    const materialItem = await this.prisma.materialItem.findUnique({
      where: { id: dto.materialItemId }
    })

    if (!materialItem) {
      throw new BadRequestException(
        `Material item with ID "${dto.materialItemId}" not found`
      )
    }

    const { materialItemId, priceCategories, ...rest } = dto

    return this.prisma.material.create({
      data: {
        ...rest,
        priceCategories: priceCategories as object,
        materialItem: { connect: { id: materialItemId } }
      },
      include: { materialItem: { include: { type: true } } }
    })
  }

  async findAll(query: MaterialQueryDto) {
    const {
      search,
      categoryId,
      typeId,
      thickness,
      sheetType,
      status,
      warningQty,
      showRemainders,
      sortBy = MaterialSortBy.DATE,
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = query

    const where: Prisma.MaterialWhereInput = {}

    // Filter through materialItem relation
    const materialItemFilter: Prisma.MaterialItemWhereInput = {}
    let hasMaterialItemFilter = false

    if (search) {
      materialItemFilter.name = { contains: search, mode: 'insensitive' }
      hasMaterialItemFilter = true
    }

    const effectiveTypeId = categoryId || typeId
    if (effectiveTypeId) {
      materialItemFilter.typeId = effectiveTypeId
      hasMaterialItemFilter = true
    }

    if (thickness !== undefined) {
      materialItemFilter.thickness = thickness
      hasMaterialItemFilter = true
    }

    if (sheetType) {
      materialItemFilter.sheetType = { contains: sheetType, mode: 'insensitive' }
      hasMaterialItemFilter = true
    }

    if (hasMaterialItemFilter) {
      where.materialItem = materialItemFilter
    }

    if (status) {
      where.status = status
    }

    // Show only items with remaining stock
    if (showRemainders) {
      where.quantity = { gt: 0 }
    }

    // Warning quantity filter - show items at or below warning threshold
    if (warningQty) {
      where.AND = [
        { warningQty: { not: null } },
        // This requires raw SQL or a workaround in Prisma
        // For now, we'll fetch and filter in memory, or use a raw query
      ]
    }

    const orderByMap: Record<
      MaterialSortBy,
      Prisma.MaterialOrderByWithRelationInput
    > = {
      [MaterialSortBy.DATE]: { date: sortOrder },
      [MaterialSortBy.QUANTITY]: { quantity: sortOrder },
      [MaterialSortBy.STATUS]: { status: sortOrder },
      [MaterialSortBy.CREATED_AT]: { createdAt: sortOrder }
    }

    const orderBy = orderByMap[sortBy]
    const skip = (page - 1) * limit

    let [data, total] = await Promise.all([
      this.prisma.material.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { materialItem: { include: { type: true } } }
      }),
      this.prisma.material.count({ where })
    ])

    // Filter for warningQty in memory if needed
    if (warningQty) {
      data = data.filter(
        material =>
          material.warningQty !== null &&
          material.quantity <= material.warningQty
      )
      total = data.length
    }

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
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: { materialItem: { include: { type: true } } }
    })

    if (!material) {
      throw new NotFoundException(`Material with ID "${id}" not found`)
    }

    return material
  }

  async update(id: string, dto: UpdateMaterialDto) {
    await this.findOne(id)

    // Validate materialItemId if provided
    if (dto.materialItemId) {
      const materialItem = await this.prisma.materialItem.findUnique({
        where: { id: dto.materialItemId }
      })

      if (!materialItem) {
        throw new BadRequestException(
          `Material item with ID "${dto.materialItemId}" not found`
        )
      }
    }

    const { materialItemId, priceCategories, ...rest } = dto

    return this.prisma.material.update({
      where: { id },
      data: {
        ...rest,
        ...(priceCategories && { priceCategories: priceCategories as object }),
        ...(materialItemId && { materialItem: { connect: { id: materialItemId } } })
      },
      include: { materialItem: { include: { type: true } } }
    })
  }

  async updateStatus(id: string, dto: UpdateMaterialStatusDto) {
    await this.findOne(id)

    return this.prisma.material.update({
      where: { id },
      data: { status: dto.status },
      include: { materialItem: { include: { type: true } } }
    })
  }

  async remove(id: string) {
    await this.findOne(id)

    await this.prisma.material.delete({ where: { id } })

    return { message: 'Material deleted successfully' }
  }

  // Helper method to create materials from purchase items (used by Purchases module)
  async createFromPurchaseItem(data: {
    date: Date
    materialItemId: string
    width: number
    length: number
    dimensions?: string
    volume?: number
    weight?: number
    priceCategories: object
    quantity: number
    comment?: string
    warningQty?: number
  }) {
    const { materialItemId, ...rest } = data

    return this.prisma.material.create({
      data: {
        ...rest,
        status: MaterialStatus.IN_PROCESS,
        materialItem: { connect: { id: materialItemId } }
      },
      include: { materialItem: { include: { type: true } } }
    })
  }
}
