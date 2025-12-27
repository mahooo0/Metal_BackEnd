import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator'

export class UpdateWriteOffItemDto {
  @ApiPropertyOptional({
    description: 'Quantity to write off',
    example: 15,
    minimum: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number

  @ApiPropertyOptional({
    description: 'Actual weight',
    example: 60.5
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number

  @ApiPropertyOptional({
    description: 'Comment for this item',
    example: 'Updated comment'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string
}
