import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator'

export class UpdateInventoryItemDto {
  @ApiProperty({
    description: 'Actual quantity counted during inventory',
    example: 10
  })
  @IsInt()
  @Min(0)
  actualQuantity: number

  @ApiPropertyOptional({
    description: 'Comment for this item',
    example: 'Found 2 damaged units'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string
}
