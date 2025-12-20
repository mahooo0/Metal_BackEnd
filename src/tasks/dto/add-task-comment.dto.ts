import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class AddTaskCommentDto {
  @ApiProperty({
    description: 'Comment text',
    example: 'Task is progressing well'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  text: string
}
