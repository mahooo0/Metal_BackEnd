import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateOrderTypeDto {
  @ApiProperty({
    description: 'Name of the order type',
    example: 'Standard Order'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string
}
