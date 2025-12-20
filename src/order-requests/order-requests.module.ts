import { Module } from '@nestjs/common'

import { UserModule } from '@/user/user.module'

import { OrderRequestsController } from './order-requests.controller'
import { OrderRequestsService } from './order-requests.service'

@Module({
  imports: [UserModule],
  controllers: [OrderRequestsController],
  providers: [OrderRequestsService],
  exports: [OrderRequestsService]
})
export class OrderRequestsModule {}
