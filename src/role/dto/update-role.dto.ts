import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateRoleDto {
  @ApiPropertyOptional({
    description: 'New name for the role. Cannot update system roles.',
    example: 'Lead Developer',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional({
    description:
      'Updated array of permission strings. This will replace all existing permissions for the role.',
    example: [
      'users:read',
      'orders:read',
      'orders:create',
      'tasks:read',
      'tasks:create',
      'tasks:update'
    ],
    type: [String],
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[]
}
