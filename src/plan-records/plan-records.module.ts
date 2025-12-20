import { Module } from '@nestjs/common'

import { UserModule } from '@/user/user.module'

import { PlanRecordsController } from './plan-records.controller'
import { PlanRecordsService } from './plan-records.service'

@Module({
  imports: [UserModule],
  controllers: [PlanRecordsController],
  providers: [PlanRecordsService],
  exports: [PlanRecordsService]
})
export class PlanRecordsModule {}
