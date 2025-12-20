import { ApiPropertyOptional } from '@nestjs/swagger'
import { OrderRequestStatus } from '@prisma/client'
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

export enum OrderRequestSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  ORDER_TYPE = 'orderType',
  CREATED_BY = 'createdBy',
  COUNTERPARTY = 'counterparty'
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export class OrderRequestQueryDto {
  @ApiPropertyOptional({
    description: 'General text search (title, description)',
    example: 'metal cutting'
  })
  @IsString()
  @IsOptional()
  search?: string

  @ApiPropertyOptional({
    description: 'Filter by creation date from',
    example: '2024-01-01'
  })
  @IsDateString()
  @IsOptional()
  dateFrom?: string

  @ApiPropertyOptional({
    description: 'Filter by creation date to',
    example: '2024-12-31'
  })
  @IsDateString()
  @IsOptional()
  dateTo?: string

  @ApiPropertyOptional({
    description: 'Filter by order type ID',
    example: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  orderTypeId?: string

  @ApiPropertyOptional({
    description: 'Filter by counterparty ID',
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
    description: 'Filter by responsible user ID (from tasks)',
    example: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  responsibleUserId?: string

  @ApiPropertyOptional({
    description: 'Filter by index-like',
    example: '653518'
  })
  @IsString()
  @IsOptional()
  indexLike?: string

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: OrderRequestStatus
  })
  @IsEnum(OrderRequestStatus)
  @IsOptional()
  status?: OrderRequestStatus

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: OrderRequestSortBy,
    default: OrderRequestSortBy.CREATED_AT
  })
  @IsEnum(OrderRequestSortBy)
  @IsOptional()
  sortBy?: OrderRequestSortBy = OrderRequestSortBy.CREATED_AT

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
