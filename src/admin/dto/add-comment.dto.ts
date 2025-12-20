import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class AddCommentDto {
  @ApiProperty({
    description: 'Comment text',
    example: 'User requested a password reset on 2024-01-15'
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  text: string
}
