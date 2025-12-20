import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'

import { PrismaService } from '@/prisma/prisma.service'

import { CreateTaskTypeDto, UpdateTaskTypeDto } from './dto'

@Injectable()
export class TaskTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskTypeDto) {
    const existing = await this.prisma.taskType.findUnique({
      where: { name: dto.name }
    })

    if (existing) {
      throw new ConflictException(
        `Task type with name "${dto.name}" already exists`
      )
    }

    return this.prisma.taskType.create({
      data: dto
    })
  }

  async findAll() {
    return this.prisma.taskType.findMany({
      orderBy: { name: 'asc' }
    })
  }

  async findOne(id: string) {
    const taskType = await this.prisma.taskType.findUnique({
      where: { id }
    })

    if (!taskType) {
      throw new NotFoundException('Task type not found')
    }

    return taskType
  }

  async update(id: string, dto: UpdateTaskTypeDto) {
    await this.findOne(id)

    if (dto.name) {
      const existing = await this.prisma.taskType.findFirst({
        where: { name: dto.name, NOT: { id } }
      })

      if (existing) {
        throw new ConflictException(
          `Task type with name "${dto.name}" already exists`
        )
      }
    }

    return this.prisma.taskType.update({
      where: { id },
      data: dto
    })
  }

  async remove(id: string) {
    await this.findOne(id)

    await this.prisma.taskType.delete({ where: { id } })

    return { message: 'Task type deleted successfully' }
  }
}
