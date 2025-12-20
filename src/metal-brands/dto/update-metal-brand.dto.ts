import { PartialType } from '@nestjs/swagger'

import { CreateMetalBrandDto } from './create-metal-brand.dto'

export class UpdateMetalBrandDto extends PartialType(CreateMetalBrandDto) {}
