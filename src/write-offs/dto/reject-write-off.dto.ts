import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class RejectWriteOffDto {
  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Incorrect quantities specified'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string
}
