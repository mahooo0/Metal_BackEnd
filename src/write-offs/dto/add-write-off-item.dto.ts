import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min
} from 'class-validator'

export class AddWriteOffItemDto {
  @ApiProperty({
    description: 'Material ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  materialId: string

  @ApiProperty({
    description: 'Quantity to write off',
    example: 10,
    minimum: 1
  })
  @IsInt()
  @Min(1)
  quantity: number

  @ApiPropertyOptional({
    description: 'Actual weight',
    example: 55.5
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number

  @ApiPropertyOptional({
    description: 'Comment for this item',
    example: 'Rust damage'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string
}
