import { Module } from '@nestjs/common'

import { AuthGuard } from '@/auth/guards/auth.guard'
import { RolesGuard } from '@/auth/guards/roles.guard'
import { UserModule } from '@/user/user.module'

import { RoleController } from './role.controller'
import { RoleService } from './role.service'

@Module({
  imports: [UserModule],
  controllers: [RoleController],
  providers: [RoleService, AuthGuard, RolesGuard],
  exports: [RoleService]
})
export class RoleModule {}
