import { ApiProperty } from '@nestjs/swagger'
import { OrderRequestStatus } from '@prisma/client'
import { IsEnum } from 'class-validator'

export class UpdateOrderRequestStatusDto {
  @ApiProperty({
    description: 'New status for the order request',
    enum: OrderRequestStatus,
    example: OrderRequestStatus.CALCULATION
  })
  @IsEnum(OrderRequestStatus)
  status: OrderRequestStatus
}
