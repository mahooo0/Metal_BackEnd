import { ApiProperty } from '@nestjs/swagger'
import { PurchaseItemStatus } from '@prisma/client'
import { IsEnum } from 'class-validator'

export class UpdatePurchaseItemStatusDto {
  @ApiProperty({
    description: 'Purchase item status',
    enum: PurchaseItemStatus,
    example: 'ORDERED'
  })
  @IsEnum(PurchaseItemStatus)
  status: PurchaseItemStatus
}
