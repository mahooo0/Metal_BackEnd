import { ApiPropertyOptional } from '@nestjs/swagger'
import { UserStatus } from '@prisma/client'
import { IsEnum, IsOptional } from 'class-validator'

export class ExportUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by user status',
    enum: UserStatus,
    example: UserStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus
}
