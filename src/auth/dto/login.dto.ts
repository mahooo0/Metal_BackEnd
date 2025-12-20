import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator'

import { IsPasswordStrong } from '@/libs/common/decorators/is-password-strong.decorator'

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address'
  })
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string

  @ApiProperty({ example: 'SecurePass123!', description: 'User password' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password must be less than 32 characters long' })
  @IsPasswordStrong()
  password: string

  @ApiPropertyOptional({
    example: '123456',
    description: '2FA token (if enabled)'
  })
  @IsOptional()
  @IsString()
  token: string
}
