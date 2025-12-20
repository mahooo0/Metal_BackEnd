import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password for verification',
    example: 'OldSecurePass123!'
  })
  @IsString({ message: 'Current password must be a string' })
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string

  @ApiProperty({
    description:
      'New password (min 6 characters). Cannot reuse recent passwords.',
    example: 'NewSecurePass456!',
    minLength: 6
  })
  @IsString({ message: 'New password must be a string' })
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string
}
