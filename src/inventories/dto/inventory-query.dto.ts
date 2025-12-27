import { ApiPropertyOptional } from '@nestjs/swagger'
import { InventoryStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min
} from 'class-validator'

export enum InventorySortBy {
  DATE = 'date',
  STATUS = 'status',
  CREATED_AT = 'createdAt'
}

export class InventoryQueryDto {
  @ApiPropertyOptional({
    description: 'Search by inventory number',
    example: 'INV-2025'
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: InventoryStatus
  })
  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus

  @ApiPropertyOptional({
    description: 'Filter by date from',
    example: '2025-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateFrom?: Date

  @ApiPropertyOptional({
    description: 'Filter by date to',
    example: '2025-12-31T23:59:59.999Z'
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateTo?: Date

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: InventorySortBy,
    default: InventorySortBy.DATE
  })
  @IsOptional()
  @IsEnum(InventorySortBy)
  sortBy?: InventorySortBy

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
