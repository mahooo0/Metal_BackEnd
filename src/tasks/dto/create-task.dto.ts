import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength
} from 'class-validator'

export class CreateTaskDto {
  @ApiProperty({
    description: 'Title of the task',
    example: 'Complete metal cutting'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string

  @ApiProperty({
    description: 'Description of the task',
    example: 'Cut 100 metal sheets according to specifications'
  })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty({
    description: 'Order request ID',
    example: 'uuid'
  })
  @IsUUID()
  @IsNotEmpty()
  orderRequestId: string

  @ApiProperty({
    description: 'Task type ID',
    example: 'uuid'
  })
  @IsUUID()
  @IsNotEmpty()
  taskTypeId: string

  @ApiProperty({
    description: 'Start execution date',
    example: '2024-01-15'
  })
  @IsDateString()
  @IsNotEmpty()
  startExecutionDate: string

  @ApiProperty({
    description: 'Start time (month, day, hour)',
    example: '2024-01-15T09:00:00Z'
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: string

  @ApiProperty({
    description: 'End time (month, day, hour)',
    example: '2024-01-15T17:00:00Z'
  })
  @IsDateString()
  @IsNotEmpty()
  endTime: string

  @ApiPropertyOptional({
    description: 'Responsible user ID',
    example: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  responsibleUserId?: string
}
