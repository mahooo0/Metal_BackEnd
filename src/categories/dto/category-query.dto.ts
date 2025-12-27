import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export enum CategorySortBy {
  NAME = 'name',
  CREATED_AT = 'createdAt'
}

export class CategoryQueryDto {
  @ApiPropertyOptional({
    description: 'Search by name',
    example: 'Steel'
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: CategorySortBy,
    default: CategorySortBy.NAME
  })
  @IsOptional()
  @IsEnum(CategorySortBy)
  sortBy?: CategorySortBy

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    default: 'asc'
  })
  @IsOptional()
  @IsString()
  sortDirection?: 'asc' | 'desc'

  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number
}
