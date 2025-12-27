import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'

export class ReceivePurchaseItemDto {
  @ApiProperty({
    description: 'Received quantity (replaces the existing value)',
    example: 5
  })
  @IsInt()
  @Min(0)
  receivedQuantity: number
}
