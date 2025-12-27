import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min
} from 'class-validator'

export enum MetalBrandSortBy {
  NAME = 'name',
  CREATED_AT = 'createdAt'
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export class MetalBrandQueryDto {
  @ApiPropertyOptional({
    description: 'Search by name',
    example: 'Steel'
  })
  @IsString()
  @IsOptional()
  search?: string

  @ApiPropertyOptional({
    description: 'Filter by category ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: MetalBrandSortBy,
    default: MetalBrandSortBy.NAME
  })
  @IsEnum(MetalBrandSortBy)
  @IsOptional()
  sortBy?: MetalBrandSortBy = MetalBrandSortBy.NAME

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: SortDirection,
    default: SortDirection.ASC
  })
  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection?: SortDirection = SortDirection.ASC

  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    default: 1
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20
}
