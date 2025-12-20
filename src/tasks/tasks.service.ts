import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { Prisma, TaskStatus, TimelineAction } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import {
  AddTaskCommentDto,
  CreateTaskDto,
  TaskQueryDto,
  TaskSortBy,
  UpdateTaskDatesDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
  UploadTaskFileDto
} from './dto'

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto, createdById: string) {
    // Validate orderRequestId
    const orderRequest = await this.prisma.orderRequest.findUnique({
      where: { id: dto.orderRequestId }
    })

    if (!orderRequest) {
      throw new BadRequestException(
        `Order request with ID "${dto.orderRequestId}" not found`
      )
    }

    // Validate taskTypeId
    const taskType = await this.prisma.taskType.findUnique({
      where: { id: dto.taskTypeId }
    })

    if (!taskType) {
      throw new BadRequestException(
        `Task type with ID "${dto.taskTypeId}" not found`
      )
    }

    // Validate responsibleUserId if provided
    if (dto.responsibleUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.responsibleUserId }
      })

      if (!user) {
        throw new BadRequestException(
          `User with ID "${dto.responsibleUserId}" not found`
        )
      }
    }

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        orderRequestId: dto.orderRequestId,
        taskTypeId: dto.taskTypeId,
        createdById,
        responsibleUserId: dto.responsibleUserId,
        startExecutionDate: new Date(dto.startExecutionDate),
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime)
      },
      include: this.getTaskIncludes()
    })
  }

  async findAll(query: TaskQueryDto) {
    const {
      search,
      startExecutionDateFrom,
      startExecutionDateTo,
      createdAtFrom,
      createdAtTo,
      taskTypeId,
      counterpartyId,
      createdById,
      responsibleUserId,
      status,
      orderRequestId,
      year,
      month,
      day,
      sortBy = TaskSortBy.CREATED_AT,
      sortDirection = 'desc',
      page = 1,
      limit = 20
    } = query

    const where: Prisma.TaskWhereInput = {}

    // General text search
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Start execution date range filter
    if (startExecutionDateFrom || startExecutionDateTo) {
      where.startExecutionDate = {}
      if (startExecutionDateFrom) {
        where.startExecutionDate.gte = new Date(startExecutionDateFrom)
      }
      if (startExecutionDateTo) {
        where.startExecutionDate.lte = new Date(startExecutionDateTo)
      }
    }

    // Created at date range filter
    if (createdAtFrom || createdAtTo) {
      where.createdAt = {}
      if (createdAtFrom) {
        where.createdAt.gte = new Date(createdAtFrom)
      }
      if (createdAtTo) {
        where.createdAt.lte = new Date(createdAtTo)
      }
    }

    // Year/Month/Day filters (based on createdAt)
    if (year) {
      const startOfYear = new Date(year, month ? month - 1 : 0, day || 1)
      let endOfPeriod: Date

      if (day && month) {
        // Specific day
        endOfPeriod = new Date(year, month - 1, day, 23, 59, 59, 999)
      } else if (month) {
        // Specific month
        endOfPeriod = new Date(year, month, 0, 23, 59, 59, 999)
      } else {
        // Whole year
        endOfPeriod = new Date(year, 11, 31, 23, 59, 59, 999)
      }

      where.createdAt = {
        ...(typeof where.createdAt === 'object' ? where.createdAt : {}),
        gte: startOfYear,
        lte: endOfPeriod
      }
    }

    // Specific filters
    if (taskTypeId) {
      where.taskTypeId = taskTypeId
    }

    if (counterpartyId) {
      where.orderRequest = {
        counterpartyId
      }
    }

    if (createdById) {
      where.createdById = createdById
    }

    if (responsibleUserId) {
      where.responsibleUserId = responsibleUserId
    }

    if (status) {
      where.status = status
    }

    if (orderRequestId) {
      where.orderRequestId = orderRequestId
    }

    // Build order by
    let orderBy: Prisma.TaskOrderByWithRelationInput

    switch (sortBy) {
      case TaskSortBy.START_EXECUTION_DATE:
        orderBy = { startExecutionDate: sortDirection }
        break
      case TaskSortBy.TYPE:
        orderBy = { taskType: { name: sortDirection } }
        break
      case TaskSortBy.STATUS:
        orderBy = { status: sortDirection }
        break
      case TaskSortBy.RESPONSIBLE_USER:
        orderBy = { responsibleUser: { displayName: sortDirection } }
        break
      case TaskSortBy.CREATED_BY:
        orderBy = { createdBy: { displayName: sortDirection } }
        break
      case TaskSortBy.CREATED_AT:
      default:
        orderBy = { createdAt: sortDirection }
    }

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          taskType: true,
          orderRequest: {
            include: {
              counterparty: true
            }
          },
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              displayName: true
            }
          },
          responsibleUser: {
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
              comments: true,
              files: true,
              timeline: true
            }
          }
        }
      }),
      this.prisma.task.count({ where })
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
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: this.getTaskIncludes()
    })

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`)
    }

    return task
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.findOne(id)

    // Validate taskTypeId if provided
    if (dto.taskTypeId && dto.taskTypeId !== task.taskTypeId) {
      const taskType = await this.prisma.taskType.findUnique({
        where: { id: dto.taskTypeId }
      })

      if (!taskType) {
        throw new BadRequestException(
          `Task type with ID "${dto.taskTypeId}" not found`
        )
      }
    }

    // Validate responsibleUserId if provided
    if (
      dto.responsibleUserId &&
      dto.responsibleUserId !== task.responsibleUserId
    ) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.responsibleUserId }
      })

      if (!user) {
        throw new BadRequestException(
          `User with ID "${dto.responsibleUserId}" not found`
        )
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        startExecutionDate: dto.startExecutionDate
          ? new Date(dto.startExecutionDate)
          : undefined,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined
      },
      include: this.getTaskIncludes()
    })
  }

  async updateStatus(id: string, dto: UpdateTaskStatusDto) {
    const task = await this.findOne(id)

    // Determine timeline action based on status change
    let timelineAction: TimelineAction | null = null

    if (
      dto.status === TaskStatus.IN_PROGRESS &&
      task.status !== TaskStatus.IN_PROGRESS
    ) {
      timelineAction =
        task.status === TaskStatus.DONE || task.status === TaskStatus.CANCELED
          ? TimelineAction.RESTART
          : TimelineAction.START
    } else if (
      dto.status === TaskStatus.DONE &&
      task.status !== TaskStatus.DONE
    ) {
      timelineAction = TimelineAction.END
    } else if (
      task.status === TaskStatus.IN_PROGRESS &&
      dto.status !== TaskStatus.IN_PROGRESS &&
      dto.status !== TaskStatus.DONE
    ) {
      timelineAction = TimelineAction.STOP
    }

    // Update task and add timeline entry if needed
    const updateData: Prisma.TaskUpdateInput = {
      status: dto.status
    }

    if (timelineAction) {
      updateData.timeline = {
        create: {
          actionName: timelineAction,
          time: new Date()
        }
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: updateData,
      include: this.getTaskIncludes()
    })
  }

  async updateDates(id: string, dto: UpdateTaskDatesDto) {
    await this.findOne(id)

    return this.prisma.task.update({
      where: { id },
      data: {
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined
      },
      include: this.getTaskIncludes()
    })
  }

  async remove(id: string) {
    await this.findOne(id)

    await this.prisma.task.delete({ where: { id } })

    return { message: 'Task deleted successfully' }
  }

  // ==================== Comments ====================

  async addComment(id: string, dto: AddTaskCommentDto, authorId: string) {
    await this.findOne(id)

    return this.prisma.taskComment.create({
      data: {
        text: dto.text,
        authorId,
        taskId: id
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

  // ==================== Files ====================

  async uploadFile(id: string, dto: UploadTaskFileDto) {
    await this.findOne(id)

    return this.prisma.taskFile.create({
      data: {
        fileName: dto.fileName,
        filePath: dto.filePath,
        fileSize: dto.fileSize,
        taskId: id
      }
    })
  }

  async removeFile(id: string, fileId: string) {
    await this.findOne(id)

    const file = await this.prisma.taskFile.findFirst({
      where: { id: fileId, taskId: id }
    })

    if (!file) {
      throw new NotFoundException(
        `File with ID "${fileId}" not found for this task`
      )
    }

    await this.prisma.taskFile.delete({ where: { id: fileId } })

    return { message: 'File deleted successfully' }
  }

  // ==================== Timeline ====================

  async addTimelineEntry(id: string, action: TimelineAction) {
    await this.findOne(id)

    return this.prisma.taskTimelineItem.create({
      data: {
        actionName: action,
        time: new Date(),
        taskId: id
      }
    })
  }

  // ==================== Helpers ====================

  private getTaskIncludes() {
    return {
      taskType: true,
      orderRequest: {
        include: {
          counterparty: true
        }
      },
      createdBy: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          displayName: true
        }
      },
      responsibleUser: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          displayName: true
        }
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
        orderBy: { createdAt: 'desc' as const }
      },
      files: {
        orderBy: { uploadedAt: 'desc' as const }
      },
      timeline: {
        orderBy: { time: 'desc' as const }
      }
    }
  }
}
