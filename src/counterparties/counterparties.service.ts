import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'

import {
  ContactDto,
  CounterpartyQueryDto,
  CreateContactDto,
  CreateCounterpartyDto,
  CreateDocumentDto,
  ReplaceContactsDto,
  ReplaceDocumentsDto,
  SortBy,
  SortOrder,
  UpdateContactDto,
  UpdateCounterpartyDto
} from './dto'

@Injectable()
export class CounterpartiesService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== Counterparty CRUD ====================

  async create(dto: CreateCounterpartyDto) {
    const { contacts, documents, ...data } = dto

    return this.prisma.counterparty.create({
      data: {
        ...data,
        contacts: contacts?.length ? { create: contacts } : undefined,
        documents: documents?.length ? { create: documents } : undefined
      },
      include: {
        contacts: true,
        documents: true
      }
    })
  }

  async findAll(query: CounterpartyQueryDto) {
    const {
      name,
      date_from,
      date_to,
      sort_by = SortBy.DATE,
      order = SortOrder.DESC,
      page = 1,
      limit = 20
    } = query

    const where: Prisma.CounterpartyWhereInput = {}

    if (name) {
      where.name = { contains: name, mode: 'insensitive' }
    }

    if (date_from || date_to) {
      where.createdAt = {}
      if (date_from) {
        where.createdAt.gte = new Date(date_from)
      }
      if (date_to) {
        where.createdAt.lte = new Date(date_to)
      }
    }

    const orderBy: Prisma.CounterpartyOrderByWithRelationInput =
      sort_by === SortBy.NAME ? { name: order } : { createdAt: order }

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.counterparty.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          contacts: true,
          documents: true
        }
      }),
      this.prisma.counterparty.count({ where })
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
    const counterparty = await this.prisma.counterparty.findUnique({
      where: { id },
      include: {
        contacts: true,
        documents: true
      }
    })

    if (!counterparty) {
      throw new NotFoundException(`Counterparty with ID "${id}" not found`)
    }

    return counterparty
  }

  async update(id: string, dto: UpdateCounterpartyDto) {
    await this.findOne(id)

    return this.prisma.counterparty.update({
      where: { id },
      data: dto,
      include: {
        contacts: true,
        documents: true
      }
    })
  }

  async replace(id: string, dto: CreateCounterpartyDto) {
    await this.findOne(id)

    const { contacts, documents, ...data } = dto

    // Delete existing contacts and documents, then create new ones
    await this.prisma.$transaction([
      this.prisma.contact.deleteMany({ where: { counterpartyId: id } }),
      this.prisma.document.deleteMany({ where: { counterpartyId: id } })
    ])

    return this.prisma.counterparty.update({
      where: { id },
      data: {
        ...data,
        contacts: contacts?.length ? { create: contacts } : undefined,
        documents: documents?.length ? { create: documents } : undefined
      },
      include: {
        contacts: true,
        documents: true
      }
    })
  }

  async remove(id: string) {
    await this.findOne(id)

    await this.prisma.counterparty.delete({ where: { id } })

    return { success: true }
  }

  // ==================== Contacts Management ====================

  async replaceContacts(counterpartyId: string, dto: ReplaceContactsDto) {
    await this.findOne(counterpartyId)

    await this.prisma.contact.deleteMany({
      where: { counterpartyId }
    })

    if (dto.contacts.length > 0) {
      await this.prisma.contact.createMany({
        data: dto.contacts.map(contact => ({
          ...contact,
          counterpartyId
        }))
      })
    }

    return this.findOne(counterpartyId)
  }

  async addContact(counterpartyId: string, dto: CreateContactDto) {
    await this.findOne(counterpartyId)

    const contact = await this.prisma.contact.create({
      data: {
        ...dto,
        counterpartyId
      }
    })

    return contact
  }

  async updateContact(
    counterpartyId: string,
    contactId: string,
    dto: UpdateContactDto
  ) {
    await this.findOne(counterpartyId)

    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, counterpartyId }
    })

    if (!contact) {
      throw new NotFoundException(
        `Contact with ID "${contactId}" not found for this counterparty`
      )
    }

    return this.prisma.contact.update({
      where: { id: contactId },
      data: dto
    })
  }

  async removeContact(counterpartyId: string, contactId: string) {
    await this.findOne(counterpartyId)

    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, counterpartyId }
    })

    if (!contact) {
      throw new NotFoundException(
        `Contact with ID "${contactId}" not found for this counterparty`
      )
    }

    await this.prisma.contact.delete({ where: { id: contactId } })

    return { success: true }
  }

  // ==================== Documents Management ====================

  async replaceDocuments(counterpartyId: string, dto: ReplaceDocumentsDto) {
    await this.findOne(counterpartyId)

    await this.prisma.document.deleteMany({
      where: { counterpartyId }
    })

    if (dto.documents.length > 0) {
      await this.prisma.document.createMany({
        data: dto.documents.map(doc => ({
          ...doc,
          counterpartyId
        }))
      })
    }

    return this.findOne(counterpartyId)
  }

  async addDocument(counterpartyId: string, dto: CreateDocumentDto) {
    await this.findOne(counterpartyId)

    const document = await this.prisma.document.create({
      data: {
        ...dto,
        counterpartyId
      }
    })

    return document
  }

  async removeDocument(counterpartyId: string, documentId: string) {
    await this.findOne(counterpartyId)

    const document = await this.prisma.document.findFirst({
      where: { id: documentId, counterpartyId }
    })

    if (!document) {
      throw new NotFoundException(
        `Document with ID "${documentId}" not found for this counterparty`
      )
    }

    await this.prisma.document.delete({ where: { id: documentId } })

    return { success: true }
  }
}
