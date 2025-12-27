import { ApiPropertyOptional } from '@nestjs/swagger'
import { MaterialStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min
} from 'class-validator'

export enum MaterialSortBy {
  DATE = 'date',
  QUANTITY = 'quantity',
  STATUS = 'status',
  CREATED_AT = 'createdAt'
}

export class MaterialQueryDto {
  @ApiPropertyOptional({
    description: 'Search by material item name',
    example: 'Steel'
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Filter by category ID (alias for typeId)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string

  @ApiPropertyOptional({
    description: 'Filter by type ID (metal brand)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsUUID()
  typeId?: string

  @ApiPropertyOptional({
    description: 'Filter by supplier ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsUUID()
  supplierId?: string

  @ApiPropertyOptional({
    description: 'Filter by thickness',
    example: 2.5
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  thickness?: number

  @ApiPropertyOptional({
    description: 'Filter by sheet type',
    example: 'Hot rolled'
  })
  @IsOptional()
  @IsString()
  sheetType?: string

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: MaterialStatus
  })
  @IsOptional()
  @IsEnum(MaterialStatus)
  status?: MaterialStatus

  @ApiPropertyOptional({
    description: 'Show only items at or below warning quantity',
    example: true
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  warningQty?: boolean

  @ApiPropertyOptional({
    description: 'Show only items with remaining quantity > 0',
    example: true
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  showRemainders?: boolean

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: MaterialSortBy,
    default: MaterialSortBy.DATE
  })
  @IsOptional()
  @IsEnum(MaterialSortBy)
  sortBy?: MaterialSortBy

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    default: 'desc'
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
