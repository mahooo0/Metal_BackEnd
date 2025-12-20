import { ApiProperty } from '@nestjs/swagger'
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  MaxLength,
  Min
} from 'class-validator'

export class CreatePlanRecordDto {
  @ApiProperty({
    description: 'Registration date of the plan',
    example: '2024-01-15'
  })
  @IsDateString()
  @IsNotEmpty()
  registrationDate: string

  @ApiProperty({
    description: 'Unique plan number',
    example: 'PLAN-2024-001'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  planNumber: string

  @ApiProperty({
    description: 'Order number reference (index from Order Request)',
    example: '653518'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  orderNumber: string

  @ApiProperty({
    description: 'Metal brand ID',
    example: 'uuid'
  })
  @IsUUID()
  @IsNotEmpty()
  metalBrandId: string

  @ApiProperty({
    description: 'Metal thickness (numeric value)',
    example: 2.5
  })
  @IsNumber()
  @Min(0)
  metalThickness: number
}

export class UploadPlanFileDto {
  @ApiProperty({
    description: 'File name',
    example: 'plan-document.pdf'
  })
  @IsString()
  @IsNotEmpty()
  fileName: string

  @ApiProperty({
    description: 'File path in storage',
    example: '/uploads/plan-records/uuid/plan-document.pdf'
  })
  @IsString()
  @IsNotEmpty()
  filePath: string

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024
  })
  @IsNumber()
  @Min(1)
  fileSize: number
}
