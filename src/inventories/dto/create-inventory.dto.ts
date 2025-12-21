import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator'

export class CreateInventoryDto {
  @ApiProperty({
    description: 'Unique inventory number',
    example: 'INV-2025-001'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  inventoryNumber: string

  @ApiProperty({
    description: 'Inventory date',
    example: '2025-12-21T00:00:00.000Z'
  })
  @Type(() => Date)
  @IsDate()
  date: Date

  @ApiPropertyOptional({
    description: 'Comment',
    example: 'Monthly inventory check'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string
}
