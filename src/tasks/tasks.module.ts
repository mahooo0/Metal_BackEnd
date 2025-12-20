import { Module } from '@nestjs/common'

import { UserModule } from '@/user/user.module'

import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'

@Module({
  imports: [UserModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService]
})
export class TasksModule {}
