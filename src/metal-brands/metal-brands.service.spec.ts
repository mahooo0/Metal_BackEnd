import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '@/prisma/prisma.service'

import { MetalBrandSortBy } from './dto'
import { MetalBrandsService } from './metal-brands.service'

describe('MetalBrandsService', () => {
  let service: MetalBrandsService

  const mockPrismaService = {
    metalBrand: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetalBrandsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()

    service = module.get<MetalBrandsService>(MetalBrandsService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    const createDto = { name: 'Steel A1' }
    const createdBrand = {
      id: 'uuid-1',
      name: 'Steel A1',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('should create a new metal brand', async () => {
      mockPrismaService.metalBrand.findUnique.mockResolvedValue(null)
      mockPrismaService.metalBrand.create.mockResolvedValue(createdBrand)

      const result = await service.create(createDto)

      expect(result).toEqual(createdBrand)
    })

    it('should throw ConflictException if name already exists', async () => {
      mockPrismaService.metalBrand.findUnique.mockResolvedValue(createdBrand)

      await expect(service.create(createDto)).rejects.toThrow(ConflictException)
    })
  })

  describe('findAll', () => {
    const brands = [
      {
        id: 'uuid-1',
        name: 'Brand A',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'uuid-2',
        name: 'Brand B',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    it('should return paginated metal brands', async () => {
      mockPrismaService.metalBrand.findMany.mockResolvedValue(brands)
      mockPrismaService.metalBrand.count.mockResolvedValue(2)

      const result = await service.findAll({
        page: 1,
        limit: 20,
        sortBy: MetalBrandSortBy.NAME,
        sortDirection: 'asc' as any
      })

      expect(result.data).toEqual(brands)
      expect(result.meta.total).toBe(2)
    })

    it('should filter by search term', async () => {
      mockPrismaService.metalBrand.findMany.mockResolvedValue([brands[0]])
      mockPrismaService.metalBrand.count.mockResolvedValue(1)

      const result = await service.findAll({
        search: 'Brand A',
        page: 1,
        limit: 20
      })

      expect(result.data).toHaveLength(1)
    })
  })

  describe('findOne', () => {
    const brand = {
      id: 'uuid-1',
      name: 'Steel A1',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('should return metal brand by id', async () => {
      mockPrismaService.metalBrand.findUnique.mockResolvedValue(brand)

      const result = await service.findOne('uuid-1')

      expect(result).toEqual(brand)
    })

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.metalBrand.findUnique.mockResolvedValue(null)

      await expect(service.findOne('uuid-1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    const brand = {
      id: 'uuid-1',
      name: 'Old Name',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('should update metal brand', async () => {
      mockPrismaService.metalBrand.findUnique.mockResolvedValue(brand)
      mockPrismaService.metalBrand.findFirst.mockResolvedValue(null)
      mockPrismaService.metalBrand.update.mockResolvedValue({
        ...brand,
        name: 'New Name'
      })

      const result = await service.update('uuid-1', { name: 'New Name' })

      expect(result.name).toBe('New Name')
    })

    it('should throw ConflictException if new name already exists', async () => {
      mockPrismaService.metalBrand.findUnique.mockResolvedValue(brand)
      mockPrismaService.metalBrand.findFirst.mockResolvedValue({
        id: 'uuid-2',
        name: 'New Name'
      })

      await expect(
        service.update('uuid-1', { name: 'New Name' })
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('remove', () => {
    const brand = {
      id: 'uuid-1',
      name: 'Steel A1',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('should delete metal brand', async () => {
      mockPrismaService.metalBrand.findUnique.mockResolvedValue(brand)
      mockPrismaService.metalBrand.delete.mockResolvedValue(brand)

      const result = await service.remove('uuid-1')

      expect(result).toEqual({ message: 'Metal brand deleted successfully' })
    })
  })
})
