import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min
} from 'class-validator'

export enum BendingPriceSortBy {
  THICKNESS = 'thickness',
  BASE_PRICE = 'basePrice',
  COEFFICIENT = 'coefficient',
  CREATED_AT = 'createdAt'
}

export class BendingPriceQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by exact thickness',
    example: 2.0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  thickness?: number

  @ApiPropertyOptional({
    description: 'Filter by Material Item ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsUUID()
  materialItemId?: string

  @ApiPropertyOptional({
    description: 'Search in description',
    example: 'steel'
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: BendingPriceSortBy,
    default: BendingPriceSortBy.THICKNESS
  })
  @IsOptional()
  @IsEnum(BendingPriceSortBy)
  sortBy?: BendingPriceSortBy

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    default: 'asc'
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc'

  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 20,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number
}
