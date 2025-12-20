import { ApiProperty } from '@nestjs/swagger'

export class RoleResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the role',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string

  @ApiProperty({
    description: 'Role name',
    example: 'Admin'
  })
  name: string

  @ApiProperty({
    description:
      'Whether this is a system role (cannot be modified or deleted)',
    example: true
  })
  system: boolean

  @ApiProperty({
    description: 'Array of permission strings assigned to this role',
    example: ['users:read', 'users:create', 'orders:read'],
    type: [String],
    isArray: true
  })
  permissions: string[]

  @ApiProperty({
    description: 'Timestamp when the role was created',
    example: '2025-11-08T10:00:00.000Z'
  })
  createdAt: Date

  @ApiProperty({
    description: 'Timestamp when the role was last updated',
    example: '2025-11-08T10:00:00.000Z'
  })
  updatedAt: Date
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Operation completed successfully'
  })
  message: string
}
