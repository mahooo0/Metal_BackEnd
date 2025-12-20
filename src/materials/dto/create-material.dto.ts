import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { MaterialStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested
} from 'class-validator'

import { PriceCategoriesDto } from './price-categories.dto'

export class CreateMaterialDto {
  @ApiProperty({
    description: 'Date of the material record',
    example: '2025-12-10T00:00:00.000Z'
  })
  @Type(() => Date)
  @IsDate()
  date: Date

  @ApiProperty({
    description: 'Material item ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  @IsNotEmpty()
  materialItemId: string

  @ApiProperty({
    description: 'Width in mm',
    example: 56
  })
  @IsNumber()
  @Min(0)
  width: number

  @ApiProperty({
    description: 'Length in mm',
    example: 24
  })
  @IsNumber()
  @Min(0)
  length: number

  @ApiPropertyOptional({
    description: 'Dimensions string',
    example: '56*24'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  dimensions?: string

  @ApiPropertyOptional({
    description: 'Volume',
    example: 346
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume?: number

  @ApiPropertyOptional({
    description: 'Weight in kg',
    example: 1098
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number

  @ApiProperty({
    description: 'Price categories',
    type: PriceCategoriesDto
  })
  @ValidateNested()
  @Type(() => PriceCategoriesDto)
  priceCategories: PriceCategoriesDto

  @ApiProperty({
    description: 'Material status',
    enum: MaterialStatus,
    example: 'IN_PROCESS'
  })
  @IsEnum(MaterialStatus)
  status: MaterialStatus

  @ApiProperty({
    description: 'Quantity',
    example: 12
  })
  @IsInt()
  @Min(0)
  quantity: number

  @ApiPropertyOptional({
    description: 'Comment',
    example: 'First batch'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string

  @ApiPropertyOptional({
    description: 'Warning quantity threshold',
    example: 5
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  warningQty?: number
}
