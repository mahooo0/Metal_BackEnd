import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min
} from 'class-validator'

export class CreateBendingPriceDto {
  @ApiProperty({
    description: 'Metal thickness (mm)',
    example: 2.0
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  thickness: number

  @ApiProperty({
    description: 'Coefficient for calculation',
    example: 1.5
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  coefficient: number

  @ApiProperty({
    description: 'Base price per operation',
    example: 100
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  basePrice: number

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
    example: 'Standard bending price for 2mm steel'
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
