import { Module } from '@nestjs/common'

import { UserModule } from '@/user/user.module'

import { TaskTypesController } from './task-types.controller'
import { TaskTypesService } from './task-types.service'

@Module({
  imports: [UserModule],
  controllers: [TaskTypesController],
  providers: [TaskTypesService],
  exports: [TaskTypesService]
})
export class TaskTypesModule {}
