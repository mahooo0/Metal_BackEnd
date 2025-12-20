import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class DocumentDto {
  @ApiProperty({
    description: 'Document name',
    example: 'Contract.pdf'
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Document name is required' })
  name: string

  @ApiProperty({
    description: 'Document type/extension',
    example: 'pdf'
  })
  @IsString({ message: 'Type must be a string' })
  @IsNotEmpty({ message: 'Document type is required' })
  type: string

  @ApiProperty({
    description: 'Path to the document file',
    example: '/docs/contract.pdf'
  })
  @IsString({ message: 'Path must be a string' })
  @IsNotEmpty({ message: 'Document path is required' })
  path: string
}

export class CreateDocumentDto extends DocumentDto {}
