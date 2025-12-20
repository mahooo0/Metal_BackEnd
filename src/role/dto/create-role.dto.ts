import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator'

export class CreateRoleDto {
  @ApiProperty({
    description: 'Unique name for the role',
    example: 'Senior Developer',
    minLength: 1,
    maxLength: 100
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required and cannot be empty' })
  @MinLength(1, { message: 'Name must be at least 1 character long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string

  @ApiProperty({
    description:
      'Array of permission strings assigned to this role. Available permissions: users:*, roles:*, orders:*, tasks:*, inventory:*, products:*, production:*, shipments:*, finance:*, reports:*, analytics:*, chat:*, settings:*, audit:*, requests:*, contractors:*, plans:*, pipeline:*',
    example: [
      'users:read',
      'users:create',
      'orders:read',
      'tasks:read',
      'tasks:create'
    ],
    type: [String],
    isArray: true
  })
  @IsArray({ message: 'Permissions must be an array' })
  @IsString({ each: true, message: 'Each permission must be a string' })
  permissions: string[]
}
