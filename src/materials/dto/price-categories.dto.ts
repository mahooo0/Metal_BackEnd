import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Min } from 'class-validator'

export class PriceCategoriesDto {
  @ApiProperty({
    description: 'Price for orders over 100 m/p',
    example: 100
  })
  @IsNumber()
  @Min(0)
  over100: number

  @ApiProperty({
    description: 'Price for orders 50-100 m/p',
    example: 120
  })
  @IsNumber()
  @Min(0)
  from50to100: number

  @ApiProperty({
    description: 'Price for orders 10-50 m/p',
    example: 150
  })
  @IsNumber()
  @Min(0)
  from10to50: number

  @ApiProperty({
    description: 'Price for orders under 10 m/p',
    example: 180
  })
  @IsNumber()
  @Min(0)
  from10: number
}
