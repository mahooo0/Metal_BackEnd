import { Global, Module } from '@nestjs/common'

import { AuthGuard } from '@/auth/guards/auth.guard'
import { RolesGuard } from '@/auth/guards/roles.guard'

import { UserController } from './user.controller'
import { UserService } from './user.service'

@Global()
@Module({
  controllers: [UserController],
  providers: [UserService, AuthGuard, RolesGuard],
  exports: [UserService, AuthGuard, RolesGuard]
})
export class UserModule {}
