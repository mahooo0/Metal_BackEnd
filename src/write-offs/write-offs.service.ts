import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { Prisma, WriteOffStatus } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import {
  AddWriteOffItemDto,
  CreateWriteOffDto,
  RejectWriteOffDto,
  UpdateWriteOffDto,
  UpdateWriteOffItemDto,
  WriteOffQueryDto,
  WriteOffSortBy
} from './dto'

@Injectable()
export class WriteOffsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWriteOffDto) {
    // Check if writeOffNumber is unique
    const existing = await this.prisma.writeOff.findUnique({
      where: { writeOffNumber: dto.writeOffNumber }
    })

    if (existing) {
      throw new ConflictException(
        `Write-off with number "${dto.writeOffNumber}" already exists`
      )
    }

    // Create write-off without items (items are added manually)
    return this.prisma.writeOff.create({
      data: {
        writeOffNumber: dto.writeOffNumber,
        date: dto.date,
        comment: dto.comment,
        status: WriteOffStatus.DRAFT
      },
      include: {
        items: {
          include: {
            material: { include: { materialItem: { include: { type: true } } } }
          }
        }
      }
    })
  }

  async findAll(query: WriteOffQueryDto) {
    const {
      search,
      status,
      dateFrom,
      dateTo,
      sortBy = WriteOffSortBy.DATE,
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = query

    const where: Prisma.WriteOffWhereInput = {}

    if (search) {
      where.writeOffNumber = { contains: search, mode: 'insensitive' }
    }

    if (status) {
      where.status = status
    }

    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) {
        where.date.gte = dateFrom
      }
      if (dateTo) {
        where.date.lte = dateTo
      }
    }

    const orderByMap: Record<
      WriteOffSortBy,
      Prisma.WriteOffOrderByWithRelationInput
    > = {
      [WriteOffSortBy.DATE]: { date: sortOrder },
      [WriteOffSortBy.STATUS]: { status: sortOrder },
      [WriteOffSortBy.TOTAL_AMOUNT]: { totalAmount: sortOrder },
      [WriteOffSortBy.CREATED_AT]: { createdAt: sortOrder }
    }

    const orderBy = orderByMap[sortBy]
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.writeOff.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: { select: { items: true } }
        }
      }),
      this.prisma.writeOff.count({ where })
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
    const writeOff = await this.prisma.writeOff.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            material: { include: { materialItem: { include: { type: true } } } }
          },
          orderBy: [
            { quantity: 'desc' }, // Items with quantity > 0 first
            { createdAt: 'asc' } // Then by creation order
          ]
        }
      }
    })

    if (!writeOff) {
      throw new NotFoundException(`Write-off with ID "${id}" not found`)
    }

    return writeOff
  }

  async update(id: string, dto: UpdateWriteOffDto) {
    const writeOff = await this.findOne(id)

    // Can only update if status is DRAFT
    if (writeOff.status !== WriteOffStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot update write-off with status "${writeOff.status}". Only DRAFT write-offs can be updated.`
      )
    }

    return this.prisma.writeOff.update({
      where: { id },
      data: dto,
      include: {
        items: {
          include: {
            material: { include: { materialItem: { include: { type: true } } } }
          }
        }
      }
    })
  }

  async addItem(writeOffId: string, dto: AddWriteOffItemDto) {
    const writeOff = await this.findOne(writeOffId)

    // Can only add items if status is DRAFT
    if (writeOff.status !== WriteOffStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot add items to write-off with status "${writeOff.status}". Only DRAFT write-offs can be modified.`
      )
    }

    // Check material exists and has sufficient quantity
    const material = await this.prisma.material.findUnique({
      where: { id: dto.materialId },
      include: { materialItem: true }
    })

    if (!material) {
      throw new NotFoundException(
        `Material with ID "${dto.materialId}" not found`
      )
    }

    if (material.quantity < dto.quantity) {
      throw new BadRequestException(
        `Insufficient quantity. Material "${material.materialItem.name}" has ${material.quantity} units, but ${dto.quantity} requested.`
      )
    }

    // Get price from material's priceCategories (use first price or default to 0)
    const priceCategories = material.priceCategories as Record<string, number>
    const pricePerUnit = Object.values(priceCategories)[0] || 0
    const amount = pricePerUnit * dto.quantity

    // Create item and update totals
    const item = await this.prisma.writeOffItem.create({
      data: {
        writeOffId,
        materialId: dto.materialId,
        quantity: dto.quantity,
        weight: dto.weight,
        pricePerUnit,
        amount,
        comment: dto.comment
      },
      include: {
        material: { include: { materialItem: { include: { type: true } } } }
      }
    })

    // Update totals
    await this.recalculateTotals(writeOffId)

    return item
  }

  async updateItem(
    writeOffId: string,
    itemId: string,
    dto: UpdateWriteOffItemDto
  ) {
    const writeOff = await this.findOne(writeOffId)

    // Can only update items if status is DRAFT
    if (writeOff.status !== WriteOffStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot update items in write-off with status "${writeOff.status}". Only DRAFT write-offs can be modified.`
      )
    }

    // Find the item
    const item = await this.prisma.writeOffItem.findUnique({
      where: { id: itemId },
      include: { material: true }
    })

    if (!item || item.writeOffId !== writeOffId) {
      throw new NotFoundException(
        `Write-off item with ID "${itemId}" not found in write-off "${writeOffId}"`
      )
    }

    // If quantity changed, validate
    if (dto.quantity !== undefined && dto.quantity !== item.quantity) {
      if (item.material.quantity < dto.quantity) {
        throw new BadRequestException(
          `Insufficient quantity. Material has ${item.material.quantity} units, but ${dto.quantity} requested.`
        )
      }
    }

    // Calculate new amount if quantity changed
    const newQuantity = dto.quantity ?? item.quantity
    const amount = item.pricePerUnit * newQuantity

    const updatedItem = await this.prisma.writeOffItem.update({
      where: { id: itemId },
      data: {
        quantity: dto.quantity,
        weight: dto.weight,
        amount,
        comment: dto.comment
      },
      include: {
        material: { include: { materialItem: { include: { type: true } } } }
      }
    })

    // Recalculate totals
    await this.recalculateTotals(writeOffId)

    return updatedItem
  }

  async removeItem(writeOffId: string, itemId: string) {
    const writeOff = await this.findOne(writeOffId)

    // Can only remove items if status is DRAFT
    if (writeOff.status !== WriteOffStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot remove items from write-off with status "${writeOff.status}". Only DRAFT write-offs can be modified.`
      )
    }

    // Find the item
    const item = await this.prisma.writeOffItem.findUnique({
      where: { id: itemId }
    })

    if (!item || item.writeOffId !== writeOffId) {
      throw new NotFoundException(
        `Write-off item with ID "${itemId}" not found in write-off "${writeOffId}"`
      )
    }

    await this.prisma.writeOffItem.delete({ where: { id: itemId } })

    // Recalculate totals
    await this.recalculateTotals(writeOffId)

    return { message: 'Item removed successfully' }
  }

  async submit(id: string) {
    const writeOff = await this.findOne(id)

    // Can only submit if status is DRAFT
    if (writeOff.status !== WriteOffStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot submit write-off with status "${writeOff.status}". Only DRAFT write-offs can be submitted.`
      )
    }

    // Filter items with quantity > 0 (items to actually write off)
    const itemsToWriteOff = writeOff.items.filter(item => item.quantity > 0)

    // Check that there's at least one item with quantity > 0
    if (itemsToWriteOff.length === 0) {
      throw new BadRequestException(
        'Cannot submit write-off without items. Add quantity to at least one item.'
      )
    }

    // Check all materials have sufficient quantity
    const insufficientItems: string[] = []
    for (const item of itemsToWriteOff) {
      if (item.material.quantity < item.quantity) {
        insufficientItems.push(
          `${item.material.materialItem.name}: has ${item.material.quantity}, needs ${item.quantity}`
        )
      }
    }

    if (insufficientItems.length > 0) {
      throw new BadRequestException({
        error: 'Validation Error',
        message: 'Insufficient quantities for some materials',
        statusCode: 400,
        details: insufficientItems
      })
    }

    // Update status to PENDING
    return this.prisma.writeOff.update({
      where: { id },
      data: {
        status: WriteOffStatus.PENDING,
        rejectedAt: null,
        rejectionReason: null
      },
      include: {
        items: {
          include: {
            material: { include: { materialItem: { include: { type: true } } } }
          }
        }
      }
    })
  }

  async approve(id: string) {
    const writeOff = await this.findOne(id)

    // Can only approve if status is PENDING
    if (writeOff.status !== WriteOffStatus.PENDING) {
      throw new BadRequestException(
        `Cannot approve write-off with status "${writeOff.status}". Only PENDING write-offs can be approved.`
      )
    }

    // Filter items with quantity > 0
    const itemsToWriteOff = writeOff.items.filter(item => item.quantity > 0)

    // Use transaction to update materials and write-off
    return this.prisma.$transaction(async tx => {
      // Update each material's quantity (only items with quantity > 0)
      for (const item of itemsToWriteOff) {
        await tx.material.update({
          where: { id: item.materialId },
          data: { quantity: { decrement: item.quantity } }
        })
      }

      // Update write-off status
      const updatedWriteOff = await tx.writeOff.update({
        where: { id },
        data: {
          status: WriteOffStatus.COMPLETED,
          completedAt: new Date()
        },
        include: {
          items: {
            include: {
              material: {
                include: { materialItem: { include: { type: true } } }
              }
            }
          }
        }
      })

      return {
        data: updatedWriteOff,
        message: `Write-off approved. ${itemsToWriteOff.length} material(s) updated. Total: ${writeOff.totalQuantity} units, ${writeOff.totalAmount} amount.`
      }
    })
  }

  async reject(id: string, dto: RejectWriteOffDto) {
    const writeOff = await this.findOne(id)

    // Can only reject if status is PENDING
    if (writeOff.status !== WriteOffStatus.PENDING) {
      throw new BadRequestException(
        `Cannot reject write-off with status "${writeOff.status}". Only PENDING write-offs can be rejected.`
      )
    }

    return this.prisma.writeOff.update({
      where: { id },
      data: {
        status: WriteOffStatus.DRAFT,
        rejectedAt: new Date(),
        rejectionReason: dto.reason
      },
      include: {
        items: {
          include: {
            material: { include: { materialItem: { include: { type: true } } } }
          }
        }
      }
    })
  }

  async remove(id: string) {
    const writeOff = await this.findOne(id)

    // Cannot delete COMPLETED or PENDING write-offs
    if (writeOff.status !== WriteOffStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot delete write-off with status "${writeOff.status}". Only DRAFT write-offs can be deleted.`
      )
    }

    await this.prisma.writeOff.delete({ where: { id } })

    return { message: 'Write-off deleted successfully' }
  }

  private async recalculateTotals(writeOffId: string) {
    const items = await this.prisma.writeOffItem.findMany({
      where: { writeOffId }
    })

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)

    await this.prisma.writeOff.update({
      where: { id: writeOffId },
      data: { totalQuantity, totalAmount }
    })
  }
}
