import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { TaskStatus, TimelineAction } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import { TasksService } from './tasks.service'

describe('TasksService', () => {
  let service: TasksService

  const mockPrismaService = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    orderRequest: {
      findUnique: jest.fn()
    },
    taskType: {
      findUnique: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    },
    taskComment: {
      create: jest.fn()
    },
    taskFile: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn()
    },
    taskTimelineItem: {
      create: jest.fn()
    }
  }

  const mockTask = {
    id: 'task-uuid-1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.PLANNING,
    orderRequestId: 'order-uuid-1',
    taskTypeId: 'type-uuid-1',
    createdById: 'user-uuid-1',
    responsibleUserId: null,
    startExecutionDate: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    taskType: { id: 'type-uuid-1', name: 'Development' },
    orderRequest: { id: 'order-uuid-1', counterparty: null },
    createdBy: { id: 'user-uuid-1', email: 'test@test.com' },
    responsibleUser: null,
    comments: [],
    files: [],
    timeline: []
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()

    service = module.get<TasksService>(TasksService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    const createDto = {
      title: 'Test Task',
      description: 'Test Description',
      orderRequestId: 'order-uuid-1',
      taskTypeId: 'type-uuid-1',
      startExecutionDate: '2024-01-15',
      startTime: '2024-01-15T09:00:00Z',
      endTime: '2024-01-15T17:00:00Z'
    }

    it('should create a new task', async () => {
      mockPrismaService.orderRequest.findUnique.mockResolvedValue({
        id: 'order-uuid-1'
      })
      mockPrismaService.taskType.findUnique.mockResolvedValue({
        id: 'type-uuid-1'
      })
      mockPrismaService.task.create.mockResolvedValue(mockTask)

      const result = await service.create(createDto, 'user-uuid-1')

      expect(result).toEqual(mockTask)
    })

    it('should throw BadRequestException if order request not found', async () => {
      mockPrismaService.orderRequest.findUnique.mockResolvedValue(null)

      await expect(service.create(createDto, 'user-uuid-1')).rejects.toThrow(
        BadRequestException
      )
    })

    it('should throw BadRequestException if task type not found', async () => {
      mockPrismaService.orderRequest.findUnique.mockResolvedValue({
        id: 'order-uuid-1'
      })
      mockPrismaService.taskType.findUnique.mockResolvedValue(null)

      await expect(service.create(createDto, 'user-uuid-1')).rejects.toThrow(
        BadRequestException
      )
    })
  })

  describe('findOne', () => {
    it('should return task by id', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask)

      const result = await service.findOne('task-uuid-1')

      expect(result).toEqual(mockTask)
    })

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null)

      await expect(service.findOne('task-uuid-1')).rejects.toThrow(
        NotFoundException
      )
    })
  })

  describe('updateStatus', () => {
    it('should update status and add START timeline entry', async () => {
      const taskWithPlanning = { ...mockTask, status: TaskStatus.PLANNING }
      mockPrismaService.task.findUnique.mockResolvedValue(taskWithPlanning)
      mockPrismaService.task.update.mockResolvedValue({
        ...taskWithPlanning,
        status: TaskStatus.IN_PROGRESS
      })

      await service.updateStatus('task-uuid-1', {
        status: TaskStatus.IN_PROGRESS
      })

      expect(mockPrismaService.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: TaskStatus.IN_PROGRESS,
            timeline: {
              create: {
                actionName: TimelineAction.START,
                time: expect.any(Date)
              }
            }
          })
        })
      )
    })

    it('should add END timeline entry when status changes to DONE', async () => {
      const taskInProgress = { ...mockTask, status: TaskStatus.IN_PROGRESS }
      mockPrismaService.task.findUnique.mockResolvedValue(taskInProgress)
      mockPrismaService.task.update.mockResolvedValue({
        ...taskInProgress,
        status: TaskStatus.DONE
      })

      await service.updateStatus('task-uuid-1', { status: TaskStatus.DONE })

      expect(mockPrismaService.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: TaskStatus.DONE,
            timeline: {
              create: {
                actionName: TimelineAction.END,
                time: expect.any(Date)
              }
            }
          })
        })
      )
    })

    it('should add RESTART timeline entry when restarting from DONE', async () => {
      const taskDone = { ...mockTask, status: TaskStatus.DONE }
      mockPrismaService.task.findUnique.mockResolvedValue(taskDone)
      mockPrismaService.task.update.mockResolvedValue({
        ...taskDone,
        status: TaskStatus.IN_PROGRESS
      })

      await service.updateStatus('task-uuid-1', {
        status: TaskStatus.IN_PROGRESS
      })

      expect(mockPrismaService.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: TaskStatus.IN_PROGRESS,
            timeline: {
              create: {
                actionName: TimelineAction.RESTART,
                time: expect.any(Date)
              }
            }
          })
        })
      )
    })
  })

  describe('addComment', () => {
    it('should add comment to task', async () => {
      const comment = {
        id: 'comment-uuid-1',
        text: 'Test comment',
        authorId: 'user-uuid-1',
        taskId: 'task-uuid-1',
        createdAt: new Date(),
        author: { id: 'user-uuid-1', email: 'test@test.com' }
      }
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask)
      mockPrismaService.taskComment.create.mockResolvedValue(comment)

      const result = await service.addComment(
        'task-uuid-1',
        { text: 'Test comment' },
        'user-uuid-1'
      )

      expect(result).toEqual(comment)
    })
  })

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      mockPrismaService.task.findMany.mockResolvedValue([mockTask])
      mockPrismaService.task.count.mockResolvedValue(1)

      const result = await service.findAll({ page: 1, limit: 20 })

      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(1)
    })

    it('should filter by year/month/day', async () => {
      mockPrismaService.task.findMany.mockResolvedValue([mockTask])
      mockPrismaService.task.count.mockResolvedValue(1)

      await service.findAll({
        year: 2024,
        month: 1,
        day: 15,
        page: 1,
        limit: 20
      })

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date)
            })
          })
        })
      )
    })

    it('should filter by responsible user', async () => {
      mockPrismaService.task.findMany.mockResolvedValue([mockTask])
      mockPrismaService.task.count.mockResolvedValue(1)

      await service.findAll({
        responsibleUserId: 'user-uuid-1',
        page: 1,
        limit: 20
      })

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            responsibleUserId: 'user-uuid-1'
          })
        })
      )
    })
  })

  describe('remove', () => {
    it('should delete task', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask)
      mockPrismaService.task.delete.mockResolvedValue(mockTask)

      const result = await service.remove('task-uuid-1')

      expect(result).toEqual({ message: 'Task deleted successfully' })
    })
  })
})
