import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator'

export class CreateWriteOffDto {
  @ApiProperty({
    description: 'Unique write-off number',
    example: 'WO-2025-001'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  writeOffNumber: string

  @ApiProperty({
    description: 'Write-off date',
    example: '2025-12-21T00:00:00.000Z'
  })
  @Type(() => Date)
  @IsDate()
  date: Date

  @ApiPropertyOptional({
    description: 'Comment',
    example: 'Damaged materials'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string
}
