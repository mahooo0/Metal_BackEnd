import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested
} from 'class-validator'

import { SupplierContactDto } from './supplier-contact.dto'

export class CreateSupplierDto {
  @ApiProperty({
    description: 'Supplier name',
    example: 'ТОВ "Базис"'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string

  @ApiPropertyOptional({
    description: 'Legal address',
    example: '65045, Україна, м Одеса, вул. Велика Арнаутська, 76'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  legalAddress?: string

  @ApiPropertyOptional({
    description: 'Actual address',
    example: '65045, Україна, м Одеса, вул. Велика Арнаутська, 76'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  actualAddress?: string

  @ApiPropertyOptional({
    description: 'Bank details',
    example: 'IBAN: UA393287040000002600205431294 в АТ КБ "ПРИВАТБАНК" (МФО 328704)'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bankDetails?: string

  @ApiPropertyOptional({
    description: 'EDRPOU code (ЄДРПОУ)',
    example: '38935167'
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  edrpou?: string

  @ApiPropertyOptional({
    description: 'IPN (ІПН)',
    example: '389351615535'
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  ipn?: string

  @ApiPropertyOptional({
    description: 'Tax ID / VAT certificate (Св-во ПДВ)',
    example: '200149913'
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string

  @ApiPropertyOptional({
    description: 'List of contacts',
    type: [SupplierContactDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupplierContactDto)
  contacts?: SupplierContactDto[]
}
