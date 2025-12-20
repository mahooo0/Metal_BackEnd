import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsString, IsUUID } from 'class-validator'

export class AssignRolesDto {
  @ApiProperty({
    description:
      'Array of role UUIDs to assign to the user. This will replace all existing role assignments.',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
    ],
    type: [String],
    isArray: true
  })
  @IsArray()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  roleIds: string[]
}
