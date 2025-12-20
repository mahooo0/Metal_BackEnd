import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateMetalBrandDto {
  @ApiProperty({
    description: 'Name of the metal brand',
    example: 'Steel A1'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string
}
