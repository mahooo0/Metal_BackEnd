import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import {
  MaterialStatus,
  Prisma,
  PurchaseItemStatus,
  PurchaseStatus
} from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import {
  CreatePurchaseDto,
  PurchaseQueryDto,
  PurchaseSortBy,
  UpdatePurchaseDto,
  UpdatePurchaseStatusDto
} from './dto'

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePurchaseDto) {
    // Validate supplier exists
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: dto.supplierId }
    })

    if (!supplier) {
      throw new BadRequestException(
        `Supplier with ID "${dto.supplierId}" not found`
      )
    }

    // Check if purchaseId is unique
    const existing = await this.prisma.purchase.findUnique({
      where: { purchaseId: dto.purchaseId }
    })

    if (existing) {
      throw new ConflictException(
        `Purchase with ID "${dto.purchaseId}" already exists`
      )
    }

    return this.prisma.purchase.create({
      data: dto,
      include: {
        supplier: { include: { contacts: true } },
        items: { include: { materialItem: { include: { type: true } } } }
      }
    })
  }

  async findAll(query: PurchaseQueryDto) {
    const {
      search,
      supplierId,
      status,
      dateFrom,
      dateTo,
      sortBy = PurchaseSortBy.DATE,
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = query

    const where: Prisma.PurchaseWhereInput = {}

    if (search) {
      where.OR = [
        { purchaseId: { contains: search, mode: 'insensitive' } },
        { comment: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (supplierId) {
      where.supplierId = supplierId
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
      PurchaseSortBy,
      Prisma.PurchaseOrderByWithRelationInput
    > = {
      [PurchaseSortBy.DATE]: { date: sortOrder },
      [PurchaseSortBy.TOTAL_AMOUNT]: { totalAmount: sortOrder },
      [PurchaseSortBy.STATUS]: { status: sortOrder },
      [PurchaseSortBy.CREATED_AT]: { createdAt: sortOrder }
    }

    const orderBy = orderByMap[sortBy]
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          supplier: true,
          items: { include: { materialItem: true } }
        }
      }),
      this.prisma.purchase.count({ where })
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
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: { include: { contacts: true } },
        items: { include: { materialItem: { include: { type: true } } } }
      }
    })

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID "${id}" not found`)
    }

    return purchase
  }

  async update(id: string, dto: UpdatePurchaseDto) {
    await this.findOne(id)

    // Validate supplier if provided
    if (dto.supplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: dto.supplierId }
      })

      if (!supplier) {
        throw new BadRequestException(
          `Supplier with ID "${dto.supplierId}" not found`
        )
      }
    }

    // Check purchaseId uniqueness if provided
    if (dto.purchaseId) {
      const existing = await this.prisma.purchase.findFirst({
        where: { purchaseId: dto.purchaseId, NOT: { id } }
      })

      if (existing) {
        throw new ConflictException(
          `Purchase with ID "${dto.purchaseId}" already exists`
        )
      }
    }

    return this.prisma.purchase.update({
      where: { id },
      data: dto,
      include: {
        supplier: { include: { contacts: true } },
        items: { include: { materialItem: { include: { type: true } } } }
      }
    })
  }

  async updateStatus(id: string, dto: UpdatePurchaseStatusDto) {
    await this.findOne(id)

    // Cannot set status to RECEIVED via this endpoint
    if (dto.status === PurchaseStatus.RECEIVED) {
      throw new BadRequestException(
        'Cannot set status to RECEIVED using this endpoint. Use POST /purchases/:id/submit instead.'
      )
    }

    return this.prisma.purchase.update({
      where: { id },
      data: { status: dto.status },
      include: {
        supplier: { include: { contacts: true } },
        items: { include: { materialItem: { include: { type: true } } } }
      }
    })
  }

  async submit(id: string) {
    // Fetch purchase with all items
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: { include: { contacts: true } },
        items: { include: { materialItem: { include: { type: true } } } }
      }
    })

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID "${id}" not found`)
    }

    // Check if already received
    if (purchase.status === PurchaseStatus.RECEIVED) {
      throw new BadRequestException('Purchase has already been submitted')
    }

    // Validate all items have status = READY
    const notReadyItems = purchase.items.filter(
      item => item.status !== PurchaseItemStatus.READY
    )

    if (notReadyItems.length > 0) {
      const details = notReadyItems.map(
        item =>
          `Item ${item.id}: status is '${item.status}', expected 'READY'`
      )

      throw new BadRequestException({
        error: 'Validation Error',
        message: 'Cannot submit purchase. Not all items are ready.',
        statusCode: 400,
        details
      })
    }

    // Validate all items have receivedQuantity >= orderedQuantity
    const incompleteItems = purchase.items.filter(
      item => item.receivedQuantity < item.orderedQuantity
    )

    if (incompleteItems.length > 0) {
      const details = incompleteItems.map(
        item =>
          `Item ${item.id}: receivedQuantity (${item.receivedQuantity}) is less than orderedQuantity (${item.orderedQuantity})`
      )

      throw new BadRequestException({
        error: 'Validation Error',
        message: 'Cannot submit purchase. Not all items are fully received.',
        statusCode: 400,
        details
      })
    }

    // Use transaction to create Materials and update Purchase
    const result = await this.prisma.$transaction(async tx => {
      // Create Material entries from each PurchaseItem
      const materialsCreated = await Promise.all(
        purchase.items.map(item =>
          tx.material.create({
            data: {
              date: item.date,
              width: item.width,
              length: item.length,
              dimensions: item.dimensions,
              volume: item.volume,
              weight: item.weight,
              priceCategories: item.priceCategories as object,
              status: MaterialStatus.IN_PROCESS,
              quantity: item.receivedQuantity,
              comment: item.comment,
              warningQty: item.warningQty,
              materialItemId: item.materialItemId
            },
            include: { materialItem: { include: { type: true } } }
          })
        )
      )

      // Update all items to RECEIVED status
      await tx.purchaseItem.updateMany({
        where: { purchaseId: id },
        data: { status: PurchaseItemStatus.RECEIVED }
      })

      // Update purchase status to RECEIVED
      const updatedPurchase = await tx.purchase.update({
        where: { id },
        data: { status: PurchaseStatus.RECEIVED },
        include: {
          supplier: { include: { contacts: true } },
          items: { include: { materialItem: { include: { type: true } } } }
        }
      })

      return { purchase: updatedPurchase, materialsCreated }
    })

    return {
      data: result.purchase,
      materialsCreated: result.materialsCreated,
      message: `Purchase submitted successfully. ${result.materialsCreated.length} material(s) created.`
    }
  }

  async remove(id: string) {
    await this.findOne(id)

    await this.prisma.purchase.delete({ where: { id } })

    return { message: 'Purchase deleted successfully' }
  }
}
