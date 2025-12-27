import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import {
  CreateMetalBrandDto,
  MetalBrandQueryDto,
  MetalBrandSortBy,
  UpdateMetalBrandDto
} from './dto'

@Injectable()
export class MetalBrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMetalBrandDto) {
    const existing = await this.prisma.metalBrand.findUnique({
      where: { name: dto.name }
    })

    if (existing) {
      throw new ConflictException(
        `Metal brand with name "${dto.name}" already exists`
      )
    }

    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId }
    })

    if (!category) {
      throw new BadRequestException(
        `Category with ID "${dto.categoryId}" not found`
      )
    }

    return this.prisma.metalBrand.create({
      data: dto,
      include: { category: true }
    })
  }

  async findAll(query: MetalBrandQueryDto) {
    const {
      search,
      categoryId,
      sortBy = MetalBrandSortBy.NAME,
      sortDirection = 'asc',
      page = 1,
      limit = 20
    } = query

    const where: Prisma.MetalBrandWhereInput = {}

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const orderBy: Prisma.MetalBrandOrderByWithRelationInput =
      sortBy === MetalBrandSortBy.NAME
        ? { name: sortDirection }
        : { createdAt: sortDirection }

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.metalBrand.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { category: true }
      }),
      this.prisma.metalBrand.count({ where })
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
    const metalBrand = await this.prisma.metalBrand.findUnique({
      where: { id },
      include: { category: true }
    })

    if (!metalBrand) {
      throw new NotFoundException(`Metal brand with ID "${id}" not found`)
    }

    return metalBrand
  }

  async update(id: string, dto: UpdateMetalBrandDto) {
    await this.findOne(id)

    if (dto.name) {
      const existing = await this.prisma.metalBrand.findFirst({
        where: { name: dto.name, NOT: { id } }
      })

      if (existing) {
        throw new ConflictException(
          `Metal brand with name "${dto.name}" already exists`
        )
      }
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId }
      })

      if (!category) {
        throw new BadRequestException(
          `Category with ID "${dto.categoryId}" not found`
        )
      }
    }

    return this.prisma.metalBrand.update({
      where: { id },
      data: dto,
      include: { category: true }
    })
  }

  async remove(id: string) {
    await this.findOne(id)

    await this.prisma.metalBrand.delete({ where: { id } })

    return { message: 'Metal brand deleted successfully' }
  }
}
