import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export enum SupplierSortBy {
  NAME = 'name',
  CREATED_AT = 'createdAt'
}

export class SupplierQueryDto {
  @ApiPropertyOptional({
    description: 'Search by name',
    example: 'Базис'
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: SupplierSortBy,
    default: SupplierSortBy.NAME
  })
  @IsOptional()
  @IsEnum(SupplierSortBy)
  sortBy?: SupplierSortBy

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
