import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateInventoryDto {
  @ApiPropertyOptional({
    description: 'Comment',
    example: 'Updated comment'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string
}
