import { Module } from '@nestjs/common'

import { UserModule } from '@/user/user.module'

import { MetalBrandsController } from './metal-brands.controller'
import { MetalBrandsService } from './metal-brands.service'

@Module({
  imports: [UserModule],
  controllers: [MetalBrandsController],
  providers: [MetalBrandsService],
  exports: [MetalBrandsService]
})
export class MetalBrandsModule {}
