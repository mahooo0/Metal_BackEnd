import { OmitType, PartialType } from '@nestjs/swagger'

import { CreateSupplierDto } from './create-supplier.dto'

// Update DTO without contacts - contacts are managed separately
export class UpdateSupplierDto extends PartialType(
  OmitType(CreateSupplierDto, ['contacts'] as const)
) {}
