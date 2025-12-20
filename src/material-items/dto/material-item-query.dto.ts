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

export enum MaterialItemSortBy {
  NAME = 'name',
  THICKNESS = 'thickness',
  CREATED_AT = 'createdAt'
}

export class MaterialItemQueryDto {
  @ApiPropertyOptional({
    description: 'Search by name',
    example: 'Steel'
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Filter by type ID (metal brand)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsUUID()
  typeId?: string

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
    description: 'Sort by field',
    enum: MaterialItemSortBy,
    default: MaterialItemSortBy.NAME
  })
  @IsOptional()
  @IsEnum(MaterialItemSortBy)
  sortBy?: MaterialItemSortBy

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
