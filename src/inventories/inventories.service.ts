import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { InventoryStatus, Prisma } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import {
  CreateInventoryDto,
  InventoryQueryDto,
  InventorySortBy,
  RejectInventoryDto,
  UpdateInventoryDto,
  UpdateInventoryItemDto
} from './dto'

@Injectable()
export class InventoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInventoryDto) {
    // Check if inventoryNumber is unique
    const existing = await this.prisma.inventory.findUnique({
      where: { inventoryNumber: dto.inventoryNumber }
    })

    if (existing) {
      throw new ConflictException(
        `Inventory with number "${dto.inventoryNumber}" already exists`
      )
    }

    // Get all materials from warehouse
    const materials = await this.prisma.material.findMany({
      include: { materialItem: { include: { type: true } } }
    })

    // Create inventory with items for each material
    return this.prisma.inventory.create({
      data: {
        inventoryNumber: dto.inventoryNumber,
        date: dto.date,
        comment: dto.comment,
        items: {
          create: materials.map(material => ({
            materialId: material.id,
            systemQuantity: material.quantity,
            actualQuantity: null,
            difference: 0
          }))
        }
      },
      include: {
        items: {
          orderBy: this.itemsOrderBy,
          include: {
            material: { include: { materialItem: { include: { type: true } } } }
          }
        }
      }
    })
  }

  async findAll(query: InventoryQueryDto) {
    const {
      search,
      status,
      dateFrom,
      dateTo,
      sortBy = InventorySortBy.DATE,
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = query

    const where: Prisma.InventoryWhereInput = {}

    if (search) {
      where.inventoryNumber = { contains: search, mode: 'insensitive' }
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
      InventorySortBy,
      Prisma.InventoryOrderByWithRelationInput
    > = {
      [InventorySortBy.DATE]: { date: sortOrder },
      [InventorySortBy.STATUS]: { status: sortOrder },
      [InventorySortBy.CREATED_AT]: { createdAt: sortOrder }
    }

    const orderBy = orderByMap[sortBy]
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: { select: { items: true } }
        }
      }),
      this.prisma.inventory.count({ where })
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

  // Common orderBy for inventory items - items with actualQuantity first, then by material name
  private readonly itemsOrderBy = [
    { actualQuantity: 'desc' as const }, // NULLs last in PostgreSQL
    { createdAt: 'asc' as const } // stable sort by creation time
  ]

  async findOne(id: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: this.itemsOrderBy,
          include: {
            material: { include: { materialItem: { include: { type: true } } } }
          }
        }
      }
    })

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID "${id}" not found`)
    }

    return inventory
  }

  async update(id: string, dto: UpdateInventoryDto) {
    const inventory = await this.findOne(id)

    // Can only update if status is IN_PROGRESS or REJECTED
    if (
      inventory.status !== InventoryStatus.IN_PROGRESS &&
      inventory.status !== InventoryStatus.REJECTED
    ) {
      throw new BadRequestException(
        `Cannot update inventory with status "${inventory.status}". Only IN_PROGRESS or REJECTED inventories can be updated.`
      )
    }

    return this.prisma.inventory.update({
      where: { id },
      data: dto,
      include: {
        items: {
          orderBy: this.itemsOrderBy,
          include: {
            material: { include: { materialItem: { include: { type: true } } } }
          }
        }
      }
    })
  }

  async updateItem(
    inventoryId: string,
    itemId: string,
    dto: UpdateInventoryItemDto
  ) {
    const inventory = await this.findOne(inventoryId)

    // Can only update items if status is IN_PROGRESS or REJECTED
    if (
      inventory.status !== InventoryStatus.IN_PROGRESS &&
      inventory.status !== InventoryStatus.REJECTED
    ) {
      throw new BadRequestException(
        `Cannot update inventory item with status "${inventory.status}". Only IN_PROGRESS or REJECTED inventories can be updated.`
      )
    }

    // Find the item
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: itemId }
    })

    if (!item || item.inventoryId !== inventoryId) {
      throw new NotFoundException(
        `Inventory item with ID "${itemId}" not found in inventory "${inventoryId}"`
      )
    }

    // Calculate difference
    const difference = dto.actualQuantity - item.systemQuantity

    // Update the item
    await this.prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        actualQuantity: dto.actualQuantity,
        difference,
        comment: dto.comment
      }
    })

    // Return the full inventory with sorted items
    return this.findOne(inventoryId)
  }

  async submit(id: string) {
    const inventory = await this.findOne(id)

    // Can only submit if status is IN_PROGRESS or REJECTED
    if (
      inventory.status !== InventoryStatus.IN_PROGRESS &&
      inventory.status !== InventoryStatus.REJECTED
    ) {
      throw new BadRequestException(
        `Cannot submit inventory with status "${inventory.status}". Only IN_PROGRESS or REJECTED inventories can be submitted.`
      )
    }

    // Check if all items have actualQuantity filled
    const incompleteItems = inventory.items.filter(
      item => item.actualQuantity === null
    )

    if (incompleteItems.length > 0) {
      throw new BadRequestException({
        error: 'Validation Error',
        message:
          'Cannot submit inventory. Not all items have actual quantity filled.',
        statusCode: 400,
        details: incompleteItems.map(
          item =>
            `Item ${item.id} (Material: ${item.material.materialItem.name}) has no actual quantity`
        )
      })
    }

    // Update status to PENDING
    return this.prisma.inventory.update({
      where: { id },
      data: {
        status: InventoryStatus.PENDING,
        rejectedAt: null,
        rejectionReason: null
      },
      include: {
        items: {
          orderBy: this.itemsOrderBy,
          include: {
            material: { include: { materialItem: { include: { type: true } } } }
          }
        }
      }
    })
  }

  async approve(id: string) {
    const inventory = await this.findOne(id)

    // Can only approve if status is PENDING
    if (inventory.status !== InventoryStatus.PENDING) {
      throw new BadRequestException(
        `Cannot approve inventory with status "${inventory.status}". Only PENDING inventories can be approved.`
      )
    }

    // Use transaction to update materials and inventory
    return this.prisma.$transaction(async tx => {
      // Update each material's quantity
      for (const item of inventory.items) {
        if (item.actualQuantity !== null) {
          await tx.material.update({
            where: { id: item.materialId },
            data: { quantity: item.actualQuantity }
          })
        }
      }

      // Update inventory status
      const updatedInventory = await tx.inventory.update({
        where: { id },
        data: {
          status: InventoryStatus.APPROVED,
          approvedAt: new Date()
        },
        include: {
          items: {
            orderBy: [
              { actualQuantity: 'desc' },
              { createdAt: 'asc' }
            ],
            include: {
              material: {
                include: { materialItem: { include: { type: true } } }
              }
            }
          }
        }
      })

      return {
        data: updatedInventory,
        message: `Inventory approved. ${inventory.items.length} material(s) updated.`
      }
    })
  }

  async reject(id: string, dto: RejectInventoryDto) {
    const inventory = await this.findOne(id)

    // Can only reject if status is PENDING
    if (inventory.status !== InventoryStatus.PENDING) {
      throw new BadRequestException(
        `Cannot reject inventory with status "${inventory.status}". Only PENDING inventories can be rejected.`
      )
    }

    return this.prisma.inventory.update({
      where: { id },
      data: {
        status: InventoryStatus.REJECTED,
        rejectedAt: new Date(),
        rejectionReason: dto.reason
      },
      include: {
        items: {
          orderBy: this.itemsOrderBy,
          include: {
            material: { include: { materialItem: { include: { type: true } } } }
          }
        }
      }
    })
  }

  async remove(id: string) {
    const inventory = await this.findOne(id)

    // Cannot delete APPROVED inventory
    if (inventory.status === InventoryStatus.APPROVED) {
      throw new BadRequestException(
        'Cannot delete approved inventory. It has already affected material quantities.'
      )
    }

    await this.prisma.inventory.delete({ where: { id } })

    return { message: 'Inventory deleted successfully' }
  }
}
