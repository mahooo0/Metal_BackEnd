import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import {
  CategoryQueryDto,
  CategorySortBy,
  CreateCategoryDto,
  UpdateCategoryDto
} from './dto'

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { name: dto.name }
    })

    if (existing) {
      throw new ConflictException(
        `Category with name "${dto.name}" already exists`
      )
    }

    return this.prisma.category.create({
      data: dto
    })
  }

  async findAll(query: CategoryQueryDto) {
    const {
      search,
      sortBy = CategorySortBy.NAME,
      sortDirection = 'asc',
      page = 1,
      limit = 20
    } = query

    const where: Prisma.CategoryWhereInput = {}

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    const orderBy: Prisma.CategoryOrderByWithRelationInput =
      sortBy === CategorySortBy.NAME
        ? { name: sortDirection }
        : { createdAt: sortDirection }

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        orderBy,
        skip,
        take: limit
      }),
      this.prisma.category.count({ where })
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
    const category = await this.prisma.category.findUnique({
      where: { id }
    })

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`)
    }

    return category
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id)

    if (dto.name) {
      const existing = await this.prisma.category.findFirst({
        where: { name: dto.name, NOT: { id } }
      })

      if (existing) {
        throw new ConflictException(
          `Category with name "${dto.name}" already exists`
        )
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: dto
    })
  }

  async remove(id: string) {
    await this.findOne(id)

    await this.prisma.category.delete({ where: { id } })

    return { message: 'Category deleted successfully' }
  }
}
