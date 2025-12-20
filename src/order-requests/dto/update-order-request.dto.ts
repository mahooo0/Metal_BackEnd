import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger'
import { OrderRequestStatus } from '@prisma/client'
import { IsEnum, IsOptional } from 'class-validator'

import { CreateOrderRequestDto } from './create-order-request.dto'

export class UpdateOrderRequestDto extends PartialType(
  OmitType(CreateOrderRequestDto, ['indexLike'] as const)
) {
  @ApiPropertyOptional({
    description: 'Status of the order request',
    enum: OrderRequestStatus
  })
  @IsEnum(OrderRequestStatus)
  @IsOptional()
  status?: OrderRequestStatus
}
