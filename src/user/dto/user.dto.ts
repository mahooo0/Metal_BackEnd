import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator'

export class UserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string

  @ApiProperty({
    description: 'User display name (shown in UI)',
    example: 'John Doe'
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  displayName: string

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John'
  })
  @IsOptional()
  @IsString()
  firstName?: string

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe'
  })
  @IsOptional()
  @IsString()
  lastName?: string

  @ApiPropertyOptional({
    description: 'User job position/title',
    example: 'Senior Developer'
  })
  @IsOptional()
  @IsString()
  position?: string

  @ApiProperty({
    description: 'Whether two-factor authentication is enabled for this user',
    example: false
  })
  @IsBoolean({ message: 'isTwoFactorEnabled must be a boolean' })
  isTwoFactorEnabled: boolean
}
