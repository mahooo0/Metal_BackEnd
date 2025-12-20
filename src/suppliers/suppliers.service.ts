import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import {
  CreateSupplierContactDto,
  CreateSupplierDto,
  SupplierQueryDto,
  SupplierSortBy,
  UpdateSupplierContactDto,
  UpdateSupplierDto
} from './dto'

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== Supplier CRUD ====================

  async create(dto: CreateSupplierDto) {
    const { contacts, ...data } = dto

    return this.prisma.supplier.create({
      data: {
        ...data,
        contacts: contacts?.length ? { create: contacts } : undefined
      },
      include: { contacts: true }
    })
  }

  async findAll(query: SupplierQueryDto) {
    const {
      search,
      sortBy = SupplierSortBy.NAME,
      sortOrder = 'asc',
      page = 1,
      limit = 20
    } = query

    const where: Prisma.SupplierWhereInput = {}

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    const orderBy: Prisma.SupplierOrderByWithRelationInput =
      sortBy === SupplierSortBy.NAME
        ? { name: sortOrder }
        : { createdAt: sortOrder }

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { contacts: true }
      }),
      this.prisma.supplier.count({ where })
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
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: { contacts: true }
    })

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID "${id}" not found`)
    }

    return supplier
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.findOne(id)

    return this.prisma.supplier.update({
      where: { id },
      data: dto,
      include: { contacts: true }
    })
  }

  async remove(id: string) {
    await this.findOne(id)

    await this.prisma.supplier.delete({ where: { id } })

    return { message: 'Supplier deleted successfully' }
  }

  // ==================== Contacts Management ====================

  async addContact(supplierId: string, dto: CreateSupplierContactDto) {
    await this.findOne(supplierId)

    const contact = await this.prisma.supplierContact.create({
      data: {
        ...dto,
        supplierId
      }
    })

    return contact
  }

  async updateContact(
    supplierId: string,
    contactId: string,
    dto: UpdateSupplierContactDto
  ) {
    await this.findOne(supplierId)

    const contact = await this.prisma.supplierContact.findFirst({
      where: { id: contactId, supplierId }
    })

    if (!contact) {
      throw new NotFoundException(
        `Contact with ID "${contactId}" not found for this supplier`
      )
    }

    return this.prisma.supplierContact.update({
      where: { id: contactId },
      data: dto
    })
  }

  async removeContact(supplierId: string, contactId: string) {
    await this.findOne(supplierId)

    const contact = await this.prisma.supplierContact.findFirst({
      where: { id: contactId, supplierId }
    })

    if (!contact) {
      throw new NotFoundException(
        `Contact with ID "${contactId}" not found for this supplier`
      )
    }

    await this.prisma.supplierContact.delete({ where: { id: contactId } })

    return { message: 'Contact deleted successfully' }
  }
}
