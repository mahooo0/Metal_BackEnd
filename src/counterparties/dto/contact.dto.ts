import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator'

export class ContactDto {
  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '+380501234567'
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^\+380\d{9}$/, {
    message: 'Phone must be in format +380XXXXXXXXX'
  })
  phone?: string

  @ApiPropertyOptional({
    description: 'Contact email address',
    example: 'contact@example.com'
  })
  @IsOptional()
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string
}

export class CreateContactDto extends ContactDto {}

export class UpdateContactDto extends ContactDto {}
