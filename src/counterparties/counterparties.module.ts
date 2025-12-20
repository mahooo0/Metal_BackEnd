import { Module } from '@nestjs/common'

import { UserModule } from '@/user/user.module'

import { CounterpartiesController } from './counterparties.controller'
import { CounterpartiesService } from './counterparties.service'

@Module({
  imports: [UserModule],
  controllers: [CounterpartiesController],
  providers: [CounterpartiesService],
  exports: [CounterpartiesService]
})
export class CounterpartiesModule {}
