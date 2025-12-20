import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min
} from 'class-validator'

export enum SortBy {
  NAME = 'name',
  DATE = 'date'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export class CounterpartyQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by name (partial match)',
    example: 'tech'
  })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({
    description: 'Filter by created_at >= date_from',
    example: '2024-01-01'
  })
  @IsOptional()
  @IsDateString({}, { message: 'date_from must be a valid date string' })
  date_from?: string

  @ApiPropertyOptional({
    description: 'Filter by created_at <= date_to',
    example: '2024-12-31'
  })
  @IsOptional()
  @IsDateString({}, { message: 'date_to must be a valid date string' })
  date_to?: string

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: SortBy,
    example: SortBy.NAME
  })
  @IsOptional()
  @IsEnum(SortBy, { message: 'sort_by must be either "name" or "date"' })
  sort_by?: SortBy

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.ASC
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: 'order must be either "asc" or "desc"' })
  order?: SortOrder

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20
}
