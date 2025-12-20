import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '@/prisma/prisma.service'

import { OrderTypesService } from './order-types.service'

describe('OrderTypesService', () => {
  let service: OrderTypesService

  const mockPrismaService = {
    orderType: {
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
        OrderTypesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()

    service = module.get<OrderTypesService>(OrderTypesService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    const createDto = { name: 'Test Order Type' }
    const createdOrderType = {
      id: 'uuid-1',
      name: 'Test Order Type',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('should create a new order type', async () => {
      mockPrismaService.orderType.findUnique.mockResolvedValue(null)
      mockPrismaService.orderType.create.mockResolvedValue(createdOrderType)

      const result = await service.create(createDto)

      expect(result).toEqual(createdOrderType)
      expect(mockPrismaService.orderType.findUnique).toHaveBeenCalledWith({
        where: { name: createDto.name }
      })
      expect(mockPrismaService.orderType.create).toHaveBeenCalledWith({
        data: createDto
      })
    })

    it('should throw ConflictException if name already exists', async () => {
      mockPrismaService.orderType.findUnique.mockResolvedValue(createdOrderType)

      await expect(service.create(createDto)).rejects.toThrow(ConflictException)
    })
  })

  describe('findAll', () => {
    const orderTypes = [
      {
        id: 'uuid-1',
        name: 'Type A',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'uuid-2',
        name: 'Type B',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    it('should return all order types', async () => {
      mockPrismaService.orderType.findMany.mockResolvedValue(orderTypes)

      const result = await service.findAll()

      expect(result).toEqual(orderTypes)
      expect(mockPrismaService.orderType.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' }
      })
    })
  })

  describe('findOne', () => {
    const orderType = {
      id: 'uuid-1',
      name: 'Test Type',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('should return order type by id', async () => {
      mockPrismaService.orderType.findUnique.mockResolvedValue(orderType)

      const result = await service.findOne('uuid-1')

      expect(result).toEqual(orderType)
    })

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.orderType.findUnique.mockResolvedValue(null)

      await expect(service.findOne('uuid-1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    const orderType = {
      id: 'uuid-1',
      name: 'Old Name',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const updateDto = { name: 'New Name' }

    it('should update order type', async () => {
      mockPrismaService.orderType.findUnique.mockResolvedValue(orderType)
      mockPrismaService.orderType.findFirst.mockResolvedValue(null)
      mockPrismaService.orderType.update.mockResolvedValue({
        ...orderType,
        name: 'New Name'
      })

      const result = await service.update('uuid-1', updateDto)

      expect(result.name).toBe('New Name')
    })

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.orderType.findUnique.mockResolvedValue(null)

      await expect(service.update('uuid-1', updateDto)).rejects.toThrow(
        NotFoundException
      )
    })

    it('should throw ConflictException if new name already exists', async () => {
      mockPrismaService.orderType.findUnique.mockResolvedValue(orderType)
      mockPrismaService.orderType.findFirst.mockResolvedValue({
        id: 'uuid-2',
        name: 'New Name'
      })

      await expect(service.update('uuid-1', updateDto)).rejects.toThrow(
        ConflictException
      )
    })
  })

  describe('remove', () => {
    const orderType = {
      id: 'uuid-1',
      name: 'Test Type',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('should delete order type', async () => {
      mockPrismaService.orderType.findUnique.mockResolvedValue(orderType)
      mockPrismaService.orderType.delete.mockResolvedValue(orderType)

      const result = await service.remove('uuid-1')

      expect(result).toEqual({ message: 'Order type deleted successfully' })
    })

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.orderType.findUnique.mockResolvedValue(null)

      await expect(service.remove('uuid-1')).rejects.toThrow(NotFoundException)
    })
  })
})
