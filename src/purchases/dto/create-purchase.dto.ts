import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PurchaseStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min
} from 'class-validator'

export class CreatePurchaseDto {
  @ApiProperty({
    description: 'Purchase date',
    example: '2025-12-10T00:00:00.000Z'
  })
  @Type(() => Date)
  @IsDate()
  date: Date

  @ApiProperty({
    description: 'Business purchase ID',
    example: '987177673'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  purchaseId: string

  @ApiProperty({
    description: 'Supplier ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  @IsNotEmpty()
  supplierId: string

  @ApiProperty({
    description: 'Total amount',
    example: 943.65
  })
  @IsNumber()
  @Min(0)
  totalAmount: number

  @ApiProperty({
    description: 'Purchase status',
    enum: PurchaseStatus,
    example: 'IN_PROCESS'
  })
  @IsEnum(PurchaseStatus)
  status: PurchaseStatus

  @ApiPropertyOptional({
    description: 'Comment',
    example: 'Lorem ipsum dolor sit amet'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string
}
