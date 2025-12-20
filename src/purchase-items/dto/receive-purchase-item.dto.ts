import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'

export class ReceivePurchaseItemDto {
  @ApiProperty({
    description: 'Quantity to receive (will be added to existing receivedQuantity)',
    example: 5
  })
  @IsInt()
  @Min(1)
  receivedQuantity: number
}
