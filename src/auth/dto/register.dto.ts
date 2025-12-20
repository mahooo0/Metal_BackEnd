import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Validate
} from 'class-validator'

import { IsPasswordsMatchingConstraint } from '@/libs/common/decorators/is-password-marching.decorator'
import { IsPasswordStrong } from '@/libs/common/decorators/is-password-strong.decorator'

export class RegisterDto {
  @ApiProperty({ example: 'John Doe', description: 'User display name' })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address'
  })
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string

  @ApiProperty({
    example: 'SecurePass123!',
    description:
      'User password (min 8, max 32 chars, must include uppercase, lowercase, number, and special character)'
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password must be less than 32 characters long' })
  @IsPasswordStrong()
  password: string

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Password confirmation (must match password)'
  })
  @IsString({ message: 'Password repeat must be a string' })
  @IsNotEmpty({ message: 'Password repeat is required' })
  @MinLength(8, {
    message: 'Password repeat must be at least 8 characters long'
  })
  @MaxLength(32, {
    message: 'Password repeat must be less than 32 characters long'
  })
  @IsPasswordStrong()
  @Validate(IsPasswordsMatchingConstraint, {
    message: 'Passwords do not match'
  })
  passwordRepeat: string
}
