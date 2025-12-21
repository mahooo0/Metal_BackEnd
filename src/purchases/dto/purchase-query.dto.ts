import { ApiPropertyOptional } from '@nestjs/swagger'
import { PurchaseStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min
} from 'class-validator'

export enum PurchaseSortBy {
  DATE = 'date',
  TOTAL_AMOUNT = 'totalAmount',
  STATUS = 'status',
  CREATED_AT = 'createdAt'
}

export class PurchaseQueryDto {
  @ApiPropertyOptional({
    description: 'Search by purchase ID or comment',
    example: '987177673'
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Filter by supplier ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsUUID()
  supplierId?: string

  @ApiPropertyOptional({
    description:
      'Filter by material item ID (purchases containing this material)',
    example: '880e8400-e29b-41d4-a716-446655440003'
  })
  @IsOptional()
  @IsUUID()
  materialItemId?: string

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: PurchaseStatus
  })
  @IsOptional()
  @IsEnum(PurchaseStatus)
  status?: PurchaseStatus

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
    enum: PurchaseSortBy,
    default: PurchaseSortBy.DATE
  })
  @IsOptional()
  @IsEnum(PurchaseSortBy)
  sortBy?: PurchaseSortBy

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
