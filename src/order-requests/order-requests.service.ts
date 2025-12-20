import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import {
  AddCommentDto,
  CreateOrderRequestDto,
  OrderRequestQueryDto,
  OrderRequestSortBy,
  UpdateOrderRequestDto,
  UpdateOrderRequestStatusDto,
  UploadFileDto
} from './dto'

@Injectable()
export class OrderRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderRequestDto, createdById: string) {
    // Check if indexLike is unique
    const existingByIndex = await this.prisma.orderRequest.findUnique({
      where: { indexLike: dto.indexLike }
    })

    if (existingByIndex) {
      throw new ConflictException(
        `Order request with indexLike "${dto.indexLike}" already exists`
      )
    }

    // Validate orderTypeId
    const orderType = await this.prisma.orderType.findUnique({
      where: { id: dto.orderTypeId }
    })

    if (!orderType) {
      throw new BadRequestException(
        `Order type with ID "${dto.orderTypeId}" not found`
      )
    }

    // Validate counterpartyId if provided
    if (dto.counterpartyId) {
      const counterparty = await this.prisma.counterparty.findUnique({
        where: { id: dto.counterpartyId }
      })

      if (!counterparty) {
        throw new BadRequestException(
          `Counterparty with ID "${dto.counterpartyId}" not found`
        )
      }
    }

    return this.prisma.orderRequest.create({
      data: {
        title: dto.title,
        description: dto.description,
        indexLike: dto.indexLike,
        orderTypeId: dto.orderTypeId,
        counterpartyId: dto.counterpartyId,
        createdById,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined
      },
      include: {
        orderType: true,
        counterparty: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
          }
        },
        files: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                displayName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  async findAll(query: OrderRequestQueryDto) {
    const {
      search,
      dateFrom,
      dateTo,
      orderTypeId,
      counterpartyId,
      createdById,
      responsibleUserId,
      indexLike,
      status,
      sortBy = OrderRequestSortBy.CREATED_AT,
      sortDirection = 'desc',
      page = 1,
      limit = 20
    } = query

    const where: Prisma.OrderRequestWhereInput = {}

    // General text search
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    }

    // Specific filters
    if (orderTypeId) {
      where.orderTypeId = orderTypeId
    }

    if (counterpartyId) {
      where.counterpartyId = counterpartyId
    }

    if (createdById) {
      where.createdById = createdById
    }

    if (indexLike) {
      where.indexLike = { contains: indexLike, mode: 'insensitive' }
    }

    if (status) {
      where.status = status
    }

    // Filter by responsible user (via tasks)
    if (responsibleUserId) {
      where.tasks = {
        some: {
          responsibleUserId
        }
      }
    }

    // Build order by
    let orderBy: Prisma.OrderRequestOrderByWithRelationInput

    switch (sortBy) {
      case OrderRequestSortBy.ORDER_TYPE:
        orderBy = { orderType: { name: sortDirection } }
        break
      case OrderRequestSortBy.CREATED_BY:
        orderBy = { createdBy: { displayName: sortDirection } }
        break
      case OrderRequestSortBy.COUNTERPARTY:
        orderBy = { counterparty: { name: sortDirection } }
        break
      case OrderRequestSortBy.UPDATED_AT:
        orderBy = { updatedAt: sortDirection }
        break
      case OrderRequestSortBy.CREATED_AT:
      default:
        orderBy = { createdAt: sortDirection }
    }

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.orderRequest.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          orderType: true,
          counterparty: true,
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              displayName: true
            }
          },
          _count: {
            select: {
              files: true,
              comments: true,
              tasks: true
            }
          }
        }
      }),
      this.prisma.orderRequest.count({ where })
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
    const orderRequest = await this.prisma.orderRequest.findUnique({
      where: { id },
      include: {
        orderType: true,
        counterparty: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
          }
        },
        files: {
          orderBy: { uploadedAt: 'desc' }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                displayName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        tasks: {
          include: {
            taskType: true,
            responsibleUser: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                displayName: true
              }
            }
          }
        }
      }
    })

    if (!orderRequest) {
      throw new NotFoundException(`Order request with ID "${id}" not found`)
    }

    return orderRequest
  }

  async update(id: string, dto: UpdateOrderRequestDto) {
    const orderRequest = await this.findOne(id)

    // Validate orderTypeId if provided
    if (dto.orderTypeId && dto.orderTypeId !== orderRequest.orderTypeId) {
      const orderType = await this.prisma.orderType.findUnique({
        where: { id: dto.orderTypeId }
      })

      if (!orderType) {
        throw new BadRequestException(
          `Order type with ID "${dto.orderTypeId}" not found`
        )
      }
    }

    // Validate counterpartyId if provided
    if (
      dto.counterpartyId &&
      dto.counterpartyId !== orderRequest.counterpartyId
    ) {
      const counterparty = await this.prisma.counterparty.findUnique({
        where: { id: dto.counterpartyId }
      })

      if (!counterparty) {
        throw new BadRequestException(
          `Counterparty with ID "${dto.counterpartyId}" not found`
        )
      }
    }

    return this.prisma.orderRequest.update({
      where: { id },
      data: {
        ...dto,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined
      },
      include: {
        orderType: true,
        counterparty: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
          }
        },
        files: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                displayName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  async updateStatus(id: string, dto: UpdateOrderRequestStatusDto) {
    await this.findOne(id)

    return this.prisma.orderRequest.update({
      where: { id },
      data: { status: dto.status },
      include: {
        orderType: true,
        counterparty: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
          }
        }
      }
    })
  }

  async remove(id: string) {
    await this.findOne(id)

    await this.prisma.orderRequest.delete({ where: { id } })

    return { message: 'Order request deleted successfully' }
  }

  async addComment(id: string, dto: AddCommentDto, authorId: string) {
    await this.findOne(id)

    return this.prisma.orderRequestComment.create({
      data: {
        text: dto.text,
        authorId,
        orderRequestId: id
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
          }
        }
      }
    })
  }

  async uploadFile(id: string, dto: UploadFileDto) {
    await this.findOne(id)

    return this.prisma.orderRequestFile.create({
      data: {
        fileName: dto.fileName,
        filePath: dto.filePath,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
        orderRequestId: id
      }
    })
  }

  async removeFile(id: string, fileId: string) {
    await this.findOne(id)

    const file = await this.prisma.orderRequestFile.findFirst({
      where: { id: fileId, orderRequestId: id }
    })

    if (!file) {
      throw new NotFoundException(
        `File with ID "${fileId}" not found for this order request`
      )
    }

    await this.prisma.orderRequestFile.delete({ where: { id: fileId } })

    return { message: 'File deleted successfully' }
  }
}
