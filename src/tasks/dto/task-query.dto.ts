import { ApiPropertyOptional } from '@nestjs/swagger'
import { TaskStatus } from '@prisma/client'
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

export enum TaskSortBy {
  CREATED_AT = 'createdAt',
  START_EXECUTION_DATE = 'startExecutionDate',
  TYPE = 'type',
  STATUS = 'status',
  RESPONSIBLE_USER = 'responsibleUser',
  CREATED_BY = 'createdBy'
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export class TaskQueryDto {
  @ApiPropertyOptional({
    description: 'General search (title, description)',
    example: 'metal cutting'
  })
  @IsString()
  @IsOptional()
  search?: string

  @ApiPropertyOptional({
    description: 'Filter by start execution date from',
    example: '2024-01-01'
  })
  @IsDateString()
  @IsOptional()
  startExecutionDateFrom?: string

  @ApiPropertyOptional({
    description: 'Filter by start execution date to',
    example: '2024-12-31'
  })
  @IsDateString()
  @IsOptional()
  startExecutionDateTo?: string

  @ApiPropertyOptional({
    description: 'Filter by creation date from',
    example: '2024-01-01'
  })
  @IsDateString()
  @IsOptional()
  createdAtFrom?: string

  @ApiPropertyOptional({
    description: 'Filter by creation date to',
    example: '2024-12-31'
  })
  @IsDateString()
  @IsOptional()
  createdAtTo?: string

  @ApiPropertyOptional({
    description: 'Filter by task type ID',
    example: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  taskTypeId?: string

  @ApiPropertyOptional({
    description: 'Filter by counterparty ID (via linked order)',
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
    description: 'Filter by responsible user ID',
    example: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  responsibleUserId?: string

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: TaskStatus
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus

  @ApiPropertyOptional({
    description: 'Filter by order request ID',
    example: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  orderRequestId?: string

  // Date-based filters for year/month/day
  @ApiPropertyOptional({
    description: 'Filter by year (based on createdAt)',
    example: 2024
  })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  @IsOptional()
  year?: number

  @ApiPropertyOptional({
    description: 'Filter by month (1-12, used with year)',
    example: 3
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  month?: number

  @ApiPropertyOptional({
    description: 'Filter by day (1-31, used with year and month)',
    example: 15
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  day?: number

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: TaskSortBy,
    default: TaskSortBy.CREATED_AT
  })
  @IsEnum(TaskSortBy)
  @IsOptional()
  sortBy?: TaskSortBy = TaskSortBy.CREATED_AT

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
