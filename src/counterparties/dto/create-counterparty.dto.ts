import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested
} from 'class-validator'

import { ContactDto } from './contact.dto'
import { DocumentDto } from './document.dto'

export class CreateCounterpartyDto {
  @ApiProperty({
    description: 'Counterparty name',
    example: 'Tech Group'
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string

  @ApiProperty({
    description: 'Internal notes / comment',
    example: 'Long-term partner'
  })
  @IsString({ message: 'Comment must be a string' })
  @IsNotEmpty({ message: 'Comment is required' })
  comment: string

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

  @ApiPropertyOptional({
    description: 'List of contacts',
    type: [ContactDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  contacts?: ContactDto[]

  @ApiPropertyOptional({
    description: 'List of documents',
    type: [DocumentDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents?: DocumentDto[]
}
