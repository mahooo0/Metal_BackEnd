import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PurchaseItemStatus } from '@prisma/client'
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

import { PriceCategoriesDto } from '@/materials/dto'

export class CreatePurchaseItemDto {
  @ApiProperty({
    description: 'Material item ID (UUID)',
    example: '880e8400-e29b-41d4-a716-446655440003'
  })
  @IsUUID()
  @IsNotEmpty()
  materialItemId: string

  @ApiProperty({
    description: 'Date of the item',
    example: '2025-12-10T00:00:00.000Z'
  })
  @Type(() => Date)
  @IsDate()
  date: Date

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
    description: 'Purchase price per unit',
    example: 100.5
  })
  @IsNumber()
  @Min(0)
  purchasePrice: number

  @ApiProperty({
    description: 'Sale price per unit',
    example: 150.75
  })
  @IsNumber()
  @Min(0)
  salePrice: number

  @ApiProperty({
    description: 'Item status',
    enum: PurchaseItemStatus,
    example: 'ORDERED'
  })
  @IsEnum(PurchaseItemStatus)
  status: PurchaseItemStatus

  @ApiProperty({
    description: 'Ordered quantity',
    example: 12
  })
  @IsInt()
  @Min(1)
  orderedQuantity: number

  @ApiProperty({
    description: 'Received quantity (initially 0)',
    example: 0
  })
  @IsInt()
  @Min(0)
  receivedQuantity: number

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
