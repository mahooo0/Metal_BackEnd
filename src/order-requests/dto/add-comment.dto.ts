import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class AddCommentDto {
  @ApiProperty({
    description: 'Comment text',
    example: 'Customer confirmed the order specifications'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  text: string
}
