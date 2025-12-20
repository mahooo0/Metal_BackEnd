import { ApiProperty } from '@nestjs/swagger'
import { PurchaseStatus } from '@prisma/client'
import { IsEnum } from 'class-validator'

export class UpdatePurchaseStatusDto {
  @ApiProperty({
    description: 'Purchase status (cannot be RECEIVED - use submit endpoint)',
    enum: [
      PurchaseStatus.IN_PROCESS,
      PurchaseStatus.UNDER_REVIEW,
      PurchaseStatus.PLANNING,
      PurchaseStatus.EXPIRED,
      PurchaseStatus.LAUNCH
    ],
    example: 'IN_PROCESS'
  })
  @IsEnum(PurchaseStatus)
  status: PurchaseStatus
}
