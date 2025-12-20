import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger'
import { TaskStatus } from '@prisma/client'
import { IsEnum, IsOptional } from 'class-validator'

import { CreateTaskDto } from './create-task.dto'

export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, ['orderRequestId'] as const)
) {
  @ApiPropertyOptional({
    description: 'Status of the task',
    enum: TaskStatus
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus
}
