import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateTaskTypeDto {
  @ApiProperty({
    description: 'Name of the task type',
    example: 'Development'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string
}
