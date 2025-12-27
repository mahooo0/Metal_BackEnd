import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { Prisma, PurchaseItemStatus } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'
import { PurchasesService } from '@/purchases/purchases.service'

import {
  CreatePurchaseItemDto,
  PurchaseItemQueryDto,
  ReceivePurchaseItemDto,
  UpdatePurchaseItemDto,
  UpdatePurchaseItemStatusDto
} from './dto'

@Injectable()
export class PurchaseItemsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => PurchasesService))
    private readonly purchasesService: PurchasesService
  ) {}

  async create(purchaseId: string, dto: CreatePurchaseItemDto) {
    // Validate purchase exists
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId }
    })

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID "${purchaseId}" not found`)
    }

    // Validate material item exists
    const materialItem = await this.prisma.materialItem.findUnique({
      where: { id: dto.materialItemId }
    })

    if (!materialItem) {
      throw new BadRequestException(
        `Material item with ID "${dto.materialItemId}" not found`
      )
    }

    const { materialItemId, priceCategories, ...rest } = dto

    const item = await this.prisma.purchaseItem.create({
      data: {
        ...rest,
        priceCategories: priceCategories as object,
        purchase: { connect: { id: purchaseId } },
        materialItem: { connect: { id: materialItemId } }
      },
      include: { materialItem: { include: { type: true } } }
    })

    // Recalculate purchase total amount
    await this.purchasesService.recalculateTotalAmount(purchaseId)

    return item
  }

  async findAll(purchaseId: string, query: PurchaseItemQueryDto) {
    const { search, page = 1, limit = 20 } = query

    // Validate purchase exists
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId }
    })

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID "${purchaseId}" not found`)
    }

    const skip = (page - 1) * limit

    // Build where condition
    const where: Prisma.PurchaseItemWhereInput = { purchaseId }

    // Add search filter by materialItem name, type name, or sheetType
    if (search) {
      where.materialItem = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { type: { name: { contains: search, mode: 'insensitive' } } },
          { sheetType: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.purchaseItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { materialItem: { include: { type: true } } }
      }),
      this.prisma.purchaseItem.count({ where })
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

  async findOne(purchaseId: string, itemId: string) {
    const item = await this.prisma.purchaseItem.findFirst({
      where: { id: itemId, purchaseId },
      include: { materialItem: { include: { type: true } } }
    })

    if (!item) {
      throw new NotFoundException(
        `Purchase item with ID "${itemId}" not found in purchase "${purchaseId}"`
      )
    }

    return item
  }

  async update(purchaseId: string, itemId: string, dto: UpdatePurchaseItemDto) {
    await this.findOne(purchaseId, itemId)

    // Validate material item if provided
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

    const item = await this.prisma.purchaseItem.update({
      where: { id: itemId },
      data: {
        ...rest,
        ...(priceCategories && { priceCategories: priceCategories as object }),
        ...(materialItemId && {
          materialItem: { connect: { id: materialItemId } }
        })
      },
      include: { materialItem: { include: { type: true } } }
    })

    // Recalculate purchase total amount if price or quantity changed
    if (dto.purchasePrice !== undefined || dto.orderedQuantity !== undefined) {
      await this.purchasesService.recalculateTotalAmount(purchaseId)
    }

    return item
  }

  async receive(
    purchaseId: string,
    itemId: string,
    dto: ReceivePurchaseItemDto
  ) {
    await this.findOne(purchaseId, itemId)

    // SET receivedQuantity (replaces existing value)
    const newReceivedQty = dto.receivedQuantity

    // Simplified status: 0 = ORDERED, >0 = READY
    const newStatus =
      newReceivedQty > 0
        ? PurchaseItemStatus.READY
        : PurchaseItemStatus.ORDERED

    const updatedItem = await this.prisma.purchaseItem.update({
      where: { id: itemId },
      data: {
        receivedQuantity: newReceivedQty,
        status: newStatus
      },
      include: { materialItem: { include: { type: true } } }
    })

    return {
      data: updatedItem,
      isReady: newStatus === PurchaseItemStatus.READY,
      message: `Received quantity set to ${newReceivedQty}`
    }
  }

  async updateStatus(
    purchaseId: string,
    itemId: string,
    dto: UpdatePurchaseItemStatusDto
  ) {
    await this.findOne(purchaseId, itemId)

    return this.prisma.purchaseItem.update({
      where: { id: itemId },
      data: { status: dto.status },
      include: { materialItem: { include: { type: true } } }
    })
  }

  async remove(purchaseId: string, itemId: string) {
    await this.findOne(purchaseId, itemId)

    await this.prisma.purchaseItem.delete({ where: { id: itemId } })

    // Recalculate purchase total amount
    await this.purchasesService.recalculateTotalAmount(purchaseId)

    return { message: 'Purchase item deleted successfully' }
  }
}
