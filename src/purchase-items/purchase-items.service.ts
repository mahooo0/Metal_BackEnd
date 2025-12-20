import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { PurchaseItemStatus } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import {
  CreatePurchaseItemDto,
  ReceivePurchaseItemDto,
  UpdatePurchaseItemDto,
  UpdatePurchaseItemStatusDto
} from './dto'

@Injectable()
export class PurchaseItemsService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.purchaseItem.create({
      data: {
        ...rest,
        priceCategories: priceCategories as object,
        purchase: { connect: { id: purchaseId } },
        materialItem: { connect: { id: materialItemId } }
      },
      include: { materialItem: { include: { type: true } } }
    })
  }

  async findAll(purchaseId: string, page = 1, limit = 20) {
    // Validate purchase exists
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId }
    })

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID "${purchaseId}" not found`)
    }

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.purchaseItem.findMany({
        where: { purchaseId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { materialItem: { include: { type: true } } }
      }),
      this.prisma.purchaseItem.count({ where: { purchaseId } })
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

  async update(
    purchaseId: string,
    itemId: string,
    dto: UpdatePurchaseItemDto
  ) {
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

    return this.prisma.purchaseItem.update({
      where: { id: itemId },
      data: {
        ...rest,
        ...(priceCategories && { priceCategories: priceCategories as object }),
        ...(materialItemId && { materialItem: { connect: { id: materialItemId } } })
      },
      include: { materialItem: { include: { type: true } } }
    })
  }

  async receive(
    purchaseId: string,
    itemId: string,
    dto: ReceivePurchaseItemDto
  ) {
    const item = await this.findOne(purchaseId, itemId)

    // Calculate new received quantity
    const newReceivedQty = item.receivedQuantity + dto.receivedQuantity

    // Validate not exceeding ordered quantity
    if (newReceivedQty > item.orderedQuantity) {
      throw new BadRequestException(
        `Cannot receive ${dto.receivedQuantity} units. ` +
          `Would exceed ordered quantity (${item.orderedQuantity}). ` +
          `Currently received: ${item.receivedQuantity}`
      )
    }

    // Determine new status based on received vs ordered
    let newStatus: PurchaseItemStatus

    if (newReceivedQty === 0) {
      newStatus = PurchaseItemStatus.ORDERED
    } else if (newReceivedQty < item.orderedQuantity) {
      newStatus = PurchaseItemStatus.PARTIALLY_RECEIVED
    } else {
      // newReceivedQty === item.orderedQuantity
      newStatus = PurchaseItemStatus.READY
    }

    const updatedItem = await this.prisma.purchaseItem.update({
      where: { id: itemId },
      data: {
        receivedQuantity: newReceivedQty,
        status: newStatus
      },
      include: { materialItem: { include: { type: true } } }
    })

    const remaining = item.orderedQuantity - newReceivedQty
    const isReady = newStatus === PurchaseItemStatus.READY

    return {
      data: updatedItem,
      isReady,
      message: isReady
        ? 'Item fully received and ready for submission'
        : `Received quantity updated. ${remaining} items remaining.`
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

    return { message: 'Purchase item deleted successfully' }
  }
}
