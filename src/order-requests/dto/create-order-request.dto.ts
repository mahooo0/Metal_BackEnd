import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength
} from 'class-validator'

export class CreateOrderRequestDto {
  @ApiProperty({
    description: 'Title of the order request',
    example: 'Metal cutting order'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string

  @ApiProperty({
    description: 'Description of the order request',
    example: 'Need to cut 100 metal sheets'
  })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty({
    description: 'Index-like identifier',
    example: '653518'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  indexLike: string

  @ApiProperty({
    description: 'Order type ID',
    example: 'uuid'
  })
  @IsUUID()
  @IsNotEmpty()
  orderTypeId: string

  @ApiPropertyOptional({
    description: 'Counterparty ID (customer)',
    example: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  counterpartyId?: string

  @ApiPropertyOptional({
    description: 'Start time of order',
    example: '2024-01-15T10:00:00Z'
  })
  @IsDateString()
  @IsOptional()
  startTime?: string

  @ApiPropertyOptional({
    description: 'End time of order',
    example: '2024-01-20T18:00:00Z'
  })
  @IsDateString()
  @IsOptional()
  endTime?: string
}
