import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '@/prisma/prisma.service'

import { TaskTypesService } from './task-types.service'

describe('TaskTypesService', () => {
  let service: TaskTypesService

  const mockPrismaService = {
    taskType: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskTypesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()

    service = module.get<TaskTypesService>(TaskTypesService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    const createDto = { name: 'Development' }
    const createdTaskType = {
      id: 'uuid-1',
      name: 'Development',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('should create a new task type', async () => {
      mockPrismaService.taskType.findUnique.mockResolvedValue(null)
      mockPrismaService.taskType.create.mockResolvedValue(createdTaskType)

      const result = await service.create(createDto)

      expect(result).toEqual(createdTaskType)
    })

    it('should throw ConflictException if name already exists', async () => {
      mockPrismaService.taskType.findUnique.mockResolvedValue(createdTaskType)

      await expect(service.create(createDto)).rejects.toThrow(ConflictException)
    })
  })

  describe('findAll', () => {
    const taskTypes = [
      {
        id: 'uuid-1',
        name: 'Development',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'uuid-2',
        name: 'Testing',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    it('should return all task types', async () => {
      mockPrismaService.taskType.findMany.mockResolvedValue(taskTypes)

      const result = await service.findAll()

      expect(result).toEqual(taskTypes)
      expect(mockPrismaService.taskType.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' }
      })
    })
  })

  describe('findOne', () => {
    const taskType = {
      id: 'uuid-1',
      name: 'Development',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('should return task type by id', async () => {
      mockPrismaService.taskType.findUnique.mockResolvedValue(taskType)

      const result = await service.findOne('uuid-1')

      expect(result).toEqual(taskType)
    })

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.taskType.findUnique.mockResolvedValue(null)

      await expect(service.findOne('uuid-1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    const taskType = {
      id: 'uuid-1',
      name: 'Old Name',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const updateDto = { name: 'New Name' }

    it('should update task type', async () => {
      mockPrismaService.taskType.findUnique.mockResolvedValue(taskType)
      mockPrismaService.taskType.findFirst.mockResolvedValue(null)
      mockPrismaService.taskType.update.mockResolvedValue({
        ...taskType,
        name: 'New Name'
      })

      const result = await service.update('uuid-1', updateDto)

      expect(result.name).toBe('New Name')
    })

    it('should throw ConflictException if new name already exists', async () => {
      mockPrismaService.taskType.findUnique.mockResolvedValue(taskType)
      mockPrismaService.taskType.findFirst.mockResolvedValue({
        id: 'uuid-2',
        name: 'New Name'
      })

      await expect(service.update('uuid-1', updateDto)).rejects.toThrow(
        ConflictException
      )
    })
  })

  describe('remove', () => {
    const taskType = {
      id: 'uuid-1',
      name: 'Development',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('should delete task type', async () => {
      mockPrismaService.taskType.findUnique.mockResolvedValue(taskType)
      mockPrismaService.taskType.delete.mockResolvedValue(taskType)

      const result = await service.remove('uuid-1')

      expect(result).toEqual({ message: 'Task type deleted successfully' })
    })
  })
})
