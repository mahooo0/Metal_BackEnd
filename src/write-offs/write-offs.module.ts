import { Module } from '@nestjs/common'

import { PrismaModule } from '@/prisma/prisma.module'

import { WriteOffsController } from './write-offs.controller'
import { WriteOffsService } from './write-offs.service'

@Module({
  imports: [PrismaModule],
  controllers: [WriteOffsController],
  providers: [WriteOffsService],
  exports: [WriteOffsService]
})
export class WriteOffsModule {}
