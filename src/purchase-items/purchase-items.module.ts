import { forwardRef, Module } from '@nestjs/common'

import { PurchasesModule } from '@/purchases/purchases.module'

import { PurchaseItemsController } from './purchase-items.controller'
import { PurchaseItemsService } from './purchase-items.service'

@Module({
  imports: [forwardRef(() => PurchasesModule)],
  controllers: [PurchaseItemsController],
  providers: [PurchaseItemsService],
  exports: [PurchaseItemsService]
})
export class PurchaseItemsModule {}
