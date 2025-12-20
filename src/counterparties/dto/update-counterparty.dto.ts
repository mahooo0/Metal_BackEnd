import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, Matches } from 'class-validator'

export class UpdateCounterpartyDto {
  @ApiPropertyOptional({
    description: 'Counterparty name',
    example: 'Tech Group'
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string

  @ApiPropertyOptional({
    description: 'Internal notes / comment',
    example: 'Long-term partner'
  })
  @IsOptional()
  @IsString({ message: 'Comment must be a string' })
  comment?: string

  @ApiPropertyOptional({
    description: 'Legal address (Юридична адреса)',
    example: 'Kyiv, X street'
  })
  @IsOptional()
  @IsString({ message: 'Legal address must be a string' })
  legalAddress?: string

  @ApiPropertyOptional({
    description: 'Actual address (Фактична адреса)',
    example: 'Kyiv, Y street'
  })
  @IsOptional()
  @IsString({ message: 'Actual address must be a string' })
  actualAddress?: string

  @ApiPropertyOptional({
    description: 'Bank details (Банківські реквізити)',
    example: 'UA123456789'
  })
  @IsOptional()
  @IsString({ message: 'Bank details must be a string' })
  bankDetails?: string

  @ApiPropertyOptional({
    description: 'EDRPOU code (ЄДРПОУ) - 8 digits',
    example: '12345678'
  })
  @IsOptional()
  @IsString({ message: 'EDRPOU must be a string' })
  @Matches(/^\d{8}$/, { message: 'EDRPOU must be exactly 8 digits' })
  edrpou?: string

  @ApiPropertyOptional({
    description: 'IPN code (ІПН) - 10 or 12 digits',
    example: '1234567890'
  })
  @IsOptional()
  @IsString({ message: 'IPN must be a string' })
  @Matches(/^\d{10}(\d{2})?$/, { message: 'IPN must be 10 or 12 digits' })
  ipn?: string

  @ApiPropertyOptional({
    description: 'VAT certificate number (Свідоцтво ПДВ)',
    example: 'VAT-12345'
  })
  @IsOptional()
  @IsString({ message: 'VAT certificate must be a string' })
  vatCertificate?: string
}
