import { ApiProperty } from '@nestjs/swagger'
import { MaterialStatus } from '@prisma/client'
import { IsEnum } from 'class-validator'

export class UpdateMaterialStatusDto {
  @ApiProperty({
    description: 'Material status',
    enum: MaterialStatus,
    example: 'IN_PROCESS'
  })
  @IsEnum(MaterialStatus)
  status: MaterialStatus
}
