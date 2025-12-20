import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class UpdateTaskDatesDto {
  @ApiPropertyOptional({
    description: 'Start time (month, day, hour)',
    example: '2024-01-15T09:00:00Z'
  })
  @IsDateString()
  @IsOptional()
  startTime?: string

  @ApiPropertyOptional({
    description: 'End time (month, day, hour)',
    example: '2024-01-15T17:00:00Z'
  })
  @IsDateString()
  @IsOptional()
  endTime?: string
}
