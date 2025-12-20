import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator'

export class SupplierContactDto {
  @ApiProperty({
    description: 'Contact name',
    example: 'Henry Arthur'
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '(217) 555-0113'
  })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({
    description: 'Contact email address',
    example: 'contact@example.com'
  })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg'
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  avatar?: string
}

export class CreateSupplierContactDto extends SupplierContactDto {}

export class UpdateSupplierContactDto {
  @ApiPropertyOptional({
    description: 'Contact name',
    example: 'Henry Arthur'
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '(217) 555-0113'
  })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({
    description: 'Contact email address',
    example: 'contact@example.com'
  })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg'
  })
  @IsOptional()
  @IsString()
  avatar?: string
}
