import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/prisma/prisma.service'

import type { ICreateRoleDto, IUpdateRoleDto } from '../interfaces'

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      orderBy: { createdAt: 'desc' }
    })
  }

  async findById(id: string) {
    return this.prisma.role.findUnique({
      where: { id }
    })
  }

  async findByName(name: string) {
    return this.prisma.role.findUnique({
      where: { name }
    })
  }

  async findManyByIds(ids: string[]) {
    return this.prisma.role.findMany({
      where: { id: { in: ids } }
    })
  }

  async create(data: ICreateRoleDto & { system?: boolean }) {
    return this.prisma.role.create({
      data: {
        name: data.name,
        permissions: data.permissions,
        system: data.system ?? false
      }
    })
  }

  async update(id: string, data: IUpdateRoleDto) {
    return this.prisma.role.update({
      where: { id },
      data
    })
  }

  async delete(id: string) {
    return this.prisma.role.delete({
      where: { id }
    })
  }

  async assignToUser(userId: string, roleId: string) {
    return this.prisma.userRole.create({
      data: {
        userId,
        roleId
      }
    })
  }

  async removeFromUser(userId: string, roleId: string) {
    return this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      }
    })
  }

  async getUserRoles(userId: string) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true }
    })

    return userRoles.map(ur => ur.role)
  }

  async syncUserRoles(userId: string, roleIds: string[]) {
    await this.prisma.$transaction(async tx => {
      await tx.userRole.deleteMany({
        where: { userId }
      })

      if (roleIds.length > 0) {
        await tx.userRole.createMany({
          data: roleIds.map(roleId => ({
            userId,
            roleId
          }))
        })
      }
    })
  }
}
