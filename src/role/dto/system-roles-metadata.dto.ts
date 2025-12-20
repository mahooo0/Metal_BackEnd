import { ApiProperty } from '@nestjs/swagger'

export class SystemRoleMetadataDto {
  @ApiProperty({
    description: 'System role name',
    example: 'Director'
  })
  name: string

  @ApiProperty({
    description: 'Description of what this role does',
    example: 'Full system access with all permissions'
  })
  description: string

  @ApiProperty({
    description: 'Array of permission strings assigned to this role',
    example: ['users:read', 'users:create', 'roles:assign'],
    type: [String]
  })
  permissions: string[]

  @ApiProperty({
    description: 'Number of permissions',
    example: 45
  })
  permissionsCount: number
}

export class SystemRolesMetadataResponseDto {
  @ApiProperty({
    description: 'Array of all system roles with their metadata',
    type: [SystemRoleMetadataDto]
  })
  systemRoles: SystemRoleMetadataDto[]

  @ApiProperty({
    description: 'Total number of system roles',
    example: 6
  })
  total: number
}
