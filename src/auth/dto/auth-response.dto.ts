import { ApiProperty } from '@nestjs/swagger'

class RoleInfoDto {
  @ApiProperty({
    description: 'Role ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string

  @ApiProperty({
    description: 'Role name',
    example: 'Admin'
  })
  name: string

  @ApiProperty({
    description: 'Whether this is a system role',
    example: true
  })
  system: boolean

  @ApiProperty({
    description: 'Array of permissions',
    example: ['users:read', 'users:create'],
    type: [String]
  })
  permissions: string[]
}

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '345f64af-e9ee-4ddc-a53b-8e80d875b984'
  })
  id: string

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  email: string

  @ApiProperty({
    description: 'User first name',
    example: 'John'
  })
  firstName: string

  @ApiProperty({
    description: 'User last name',
    example: 'Doe'
  })
  lastName: string

  @ApiProperty({
    description: 'User display name',
    example: 'John Doe'
  })
  displayName: string

  @ApiProperty({
    description: 'User job position',
    example: 'Senior Developer',
    nullable: true
  })
  position: string | null

  @ApiProperty({
    description: 'User account status',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INVITED', 'BLOCKED', 'DELETED']
  })
  status: string

  @ApiProperty({
    description: 'Whether email is verified',
    example: true
  })
  isVerified: boolean

  @ApiProperty({
    description: 'Whether two-factor authentication is enabled',
    example: false
  })
  isTwoFactorEnabled: boolean

  @ApiProperty({
    description: 'Authentication method',
    example: 'CREDENTIALS',
    enum: ['CREDENTIALS', 'GOOGLE']
  })
  method: string

  @ApiProperty({
    description: 'User roles',
    type: [RoleInfoDto]
  })
  roles: RoleInfoDto[]

  @ApiProperty({
    description:
      'All permissions available to the user (aggregated from roles and overrides)',
    example: ['users:read', 'users:create', 'orders:read'],
    type: [String]
  })
  permissions: string[]

  @ApiProperty({
    description: 'Last login timestamp',
    example: '2025-11-08T12:00:00.000Z',
    nullable: true
  })
  lastLoginAt: Date | null

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2025-11-08T10:00:00.000Z'
  })
  createdAt: Date

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-11-08T12:00:00.000Z'
  })
  updatedAt: Date
}

export class LoginResponseDto extends UserResponseDto {}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Success message',
    example:
      'User created successfully. Please confirm your email. Message was sent to your email'
  })
  message: string
}
