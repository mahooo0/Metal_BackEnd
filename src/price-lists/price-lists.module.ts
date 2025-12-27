import { Module } from '@nestjs/common'

import { PrismaModule } from '@/prisma/prisma.module'

import { BendingPricesController } from './bending-prices/bending-prices.controller'
import { BendingPricesService } from './bending-prices/bending-prices.service'
import { CuttingPricesController } from './cutting-prices/cutting-prices.controller'
import { CuttingPricesService } from './cutting-prices/cutting-prices.service'

@Module({
  imports: [PrismaModule],
  controllers: [BendingPricesController, CuttingPricesController],
  providers: [BendingPricesService, CuttingPricesService],
  exports: [BendingPricesService, CuttingPricesService]
})
export class PriceListsModule {}
