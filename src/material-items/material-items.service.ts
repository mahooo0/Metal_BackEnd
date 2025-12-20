import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import {
  CreateMaterialItemDto,
  MaterialItemQueryDto,
  MaterialItemSortBy,
  UpdateMaterialItemDto
} from './dto'

@Injectable()
export class MaterialItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaterialItemDto) {
    // Validate that the typeId (MetalBrand) exists
    const metalBrand = await this.prisma.metalBrand.findUnique({
      where: { id: dto.typeId }
    })

    if (!metalBrand) {
      throw new BadRequestException(
        `Metal brand with ID "${dto.typeId}" not found`
      )
    }

    return this.prisma.materialItem.create({
      data: dto,
      include: { type: true }
    })
  }

  async findAll(query: MaterialItemQueryDto) {
    const {
      search,
      typeId,
      thickness,
      sheetType,
      sortBy = MaterialItemSortBy.NAME,
      sortOrder = 'asc',
      page = 1,
      limit = 20
    } = query

    const where: Prisma.MaterialItemWhereInput = {}

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    if (typeId) {
      where.typeId = typeId
    }

    if (thickness !== undefined) {
      where.thickness = thickness
    }

    if (sheetType) {
      where.sheetType = { contains: sheetType, mode: 'insensitive' }
    }

    const orderByMap: Record<
      MaterialItemSortBy,
      Prisma.MaterialItemOrderByWithRelationInput
    > = {
      [MaterialItemSortBy.NAME]: { name: sortOrder },
      [MaterialItemSortBy.THICKNESS]: { thickness: sortOrder },
      [MaterialItemSortBy.CREATED_AT]: { createdAt: sortOrder }
    }

    const orderBy = orderByMap[sortBy]
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.materialItem.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { type: true }
      }),
      this.prisma.materialItem.count({ where })
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
    const materialItem = await this.prisma.materialItem.findUnique({
      where: { id },
      include: { type: true }
    })

    if (!materialItem) {
      throw new NotFoundException(`Material item with ID "${id}" not found`)
    }

    return materialItem
  }

  async update(id: string, dto: UpdateMaterialItemDto) {
    await this.findOne(id)

    // Validate typeId if provided
    if (dto.typeId) {
      const metalBrand = await this.prisma.metalBrand.findUnique({
        where: { id: dto.typeId }
      })

      if (!metalBrand) {
        throw new BadRequestException(
          `Metal brand with ID "${dto.typeId}" not found`
        )
      }
    }

    return this.prisma.materialItem.update({
      where: { id },
      data: dto,
      include: { type: true }
    })
  }

  async remove(id: string) {
    await this.findOne(id)

    await this.prisma.materialItem.delete({ where: { id } })

    return { message: 'Material item deleted successfully' }
  }
}
