import { Module } from '@nestjs/common'

import { MaterialItemsController } from './material-items.controller'
import { MaterialItemsService } from './material-items.service'

@Module({
  controllers: [MaterialItemsController],
  providers: [MaterialItemsService],
  exports: [MaterialItemsService]
})
export class MaterialItemsModule {}
