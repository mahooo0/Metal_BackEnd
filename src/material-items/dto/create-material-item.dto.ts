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

export class CreateMaterialItemDto {
  @ApiProperty({
    description: 'Name of the material item',
    example: 'Steel Sheet 2mm'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string

  @ApiProperty({
    description: 'Thickness in mm',
    example: 2.5
  })
  @IsNumber()
  @Min(0)
  thickness: number

  @ApiProperty({
    description: 'Metal brand/type ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  @IsNotEmpty()
  typeId: string

  @ApiProperty({
    description: 'Sheet type',
    example: 'Hot rolled'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  sheetType: string

  @ApiPropertyOptional({
    description: 'Cutting supply rate',
    example: 1.5
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cuttingSupply?: number

  @ApiPropertyOptional({
    description: 'Cutting time',
    example: 10.5
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cuttingTime?: number

  @ApiPropertyOptional({
    description: 'Description of the material item',
    example: 'High quality steel sheet for industrial use'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string
}
