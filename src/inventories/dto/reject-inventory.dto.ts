import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class RejectInventoryDto {
  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Incorrect counts in several items'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string
}
