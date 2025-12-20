import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'

import { PrismaService } from '@/prisma/prisma.service'

import { CreateOrderTypeDto, UpdateOrderTypeDto } from './dto'

@Injectable()
export class OrderTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderTypeDto) {
    const existing = await this.prisma.orderType.findUnique({
      where: { name: dto.name }
    })

    if (existing) {
      throw new ConflictException(
        `Order type with name "${dto.name}" already exists`
      )
    }

    return this.prisma.orderType.create({
      data: dto
    })
  }

  async findAll() {
    return this.prisma.orderType.findMany({
      orderBy: { name: 'asc' }
    })
  }

  async findOne(id: string) {
    const orderType = await this.prisma.orderType.findUnique({
      where: { id }
    })

    if (!orderType) {
      throw new NotFoundException('Order type not found')
    }

    return orderType
  }

  async update(id: string, dto: UpdateOrderTypeDto) {
    await this.findOne(id)

    if (dto.name) {
      const existing = await this.prisma.orderType.findFirst({
        where: { name: dto.name, NOT: { id } }
      })

      if (existing) {
        throw new ConflictException(
          `Order type with name "${dto.name}" already exists`
        )
      }
    }

    return this.prisma.orderType.update({
      where: { id },
      data: dto
    })
  }

  async remove(id: string) {
    await this.findOne(id)

    // Check if there are any order requests using this order type
    const orderRequestCount = await this.prisma.orderRequest.count({
      where: { orderTypeId: id }
    })

    if (orderRequestCount > 0) {
      throw new ConflictException(
        `Cannot delete order type. It is being used by ${orderRequestCount} order request(s). Please delete or reassign those order requests first.`
      )
    }

    await this.prisma.orderType.delete({ where: { id } })

    return { message: 'Order type deleted successfully' }
  }
}
