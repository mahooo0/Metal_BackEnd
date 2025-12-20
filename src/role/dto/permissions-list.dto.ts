import { ApiProperty } from '@nestjs/swagger'

export class PermissionCategoryDto {
  @ApiProperty({
    description: 'Category name (e.g., "users", "roles", "orders")',
    example: 'users'
  })
  category: string

  @ApiProperty({
    description: 'Human-readable category label',
    example: 'User Management'
  })
  label: string

  @ApiProperty({
    description: 'Array of permission strings in this category',
    example: ['users:read', 'users:create', 'users:update', 'users:delete'],
    type: [String]
  })
  permissions: string[]
}

export class AllPermissionsResponseDto {
  @ApiProperty({
    description: 'Total number of available permissions',
    example: 68
  })
  total: number

  @ApiProperty({
    description: 'Permissions grouped by category',
    type: [PermissionCategoryDto]
  })
  categories: PermissionCategoryDto[]

  @ApiProperty({
    description: 'Flat array of all permission strings',
    example: ['users:read', 'users:create', 'orders:read', 'orders:create'],
    type: [String]
  })
  all: string[]
}
