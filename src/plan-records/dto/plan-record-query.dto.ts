import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min
} from 'class-validator'

export enum PlanRecordSortBy {
  REGISTRATION_DATE = 'registrationDate',
  PLAN_NUMBER = 'planNumber',
  ORDER_NUMBER = 'orderNumber',
  CUSTOMER = 'customer',
  CREATED_BY = 'createdBy'
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export class PlanRecordQueryDto {
  @ApiPropertyOptional({
    description: 'General search (planNumber, orderNumber, customer)',
    example: 'PLAN-2024'
  })
  @IsString()
  @IsOptional()
  search?: string

  @ApiPropertyOptional({
    description: 'Filter by registration date from',
    example: '2024-01-01'
  })
  @IsDateString()
  @IsOptional()
  dateFrom?: string

  @ApiPropertyOptional({
    description: 'Filter by registration date to',
    example: '2024-12-31'
  })
  @IsDateString()
  @IsOptional()
  dateTo?: string

  @ApiPropertyOptional({
    description: 'Filter by counterparty ID (from linked order)',
    example: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  counterpartyId?: string

  @ApiPropertyOptional({
    description: 'Filter by creator ID',
    example: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  createdById?: string

  @ApiPropertyOptional({
    description: 'Filter by metal brand ID',
    example: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  metalBrandId?: string

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: PlanRecordSortBy,
    default: PlanRecordSortBy.REGISTRATION_DATE
  })
  @IsEnum(PlanRecordSortBy)
  @IsOptional()
  sortBy?: PlanRecordSortBy = PlanRecordSortBy.REGISTRATION_DATE

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: SortDirection,
    default: SortDirection.DESC
  })
  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection?: SortDirection = SortDirection.DESC

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
