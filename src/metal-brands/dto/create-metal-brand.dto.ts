import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator'

export class CreateMetalBrandDto {
  @ApiProperty({
    description: 'Name of the metal brand',
    example: 'Steel A1'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string

  @ApiProperty({
    description: 'Category ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string
}
