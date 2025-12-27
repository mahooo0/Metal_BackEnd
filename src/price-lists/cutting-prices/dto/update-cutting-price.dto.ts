import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min
} from 'class-validator'

export class UpdateCuttingPriceDto {
  @ApiPropertyOptional({
    description: 'Metal thickness (mm)',
    example: 2.0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  thickness?: number

  @ApiPropertyOptional({
    description: 'Price per meter',
    example: 50
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerMeter?: number

  @ApiPropertyOptional({
    description: 'Price per hour',
    example: 1000
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerHour?: number

  @ApiPropertyOptional({
    description: 'Setup price',
    example: 200
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  setupPrice?: number

  @ApiPropertyOptional({
    description: 'Minimum price',
    example: 50
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Standard cutting price for 2mm steel'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @ApiPropertyOptional({
    description: 'Material Item ID (optional link to catalog)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsUUID()
  materialItemId?: string
}
