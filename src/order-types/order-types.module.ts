import { Module } from '@nestjs/common'

import { UserModule } from '@/user/user.module'

import { OrderTypesController } from './order-types.controller'
import { OrderTypesService } from './order-types.service'

@Module({
  imports: [UserModule],
  controllers: [OrderTypesController],
  providers: [OrderTypesService],
  exports: [OrderTypesService]
})
export class OrderTypesModule {}
