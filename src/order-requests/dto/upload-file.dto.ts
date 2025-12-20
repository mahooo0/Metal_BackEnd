import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator'

export class UploadFileDto {
  @ApiProperty({
    description: 'File name',
    example: 'document.pdf'
  })
  @IsString()
  @IsNotEmpty()
  fileName: string

  @ApiProperty({
    description: 'File path in storage',
    example: '/uploads/order-requests/uuid/document.pdf'
  })
  @IsString()
  @IsNotEmpty()
  filePath: string

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024
  })
  @IsInt()
  @Min(1)
  fileSize: number

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf'
  })
  @IsString()
  @IsNotEmpty()
  mimeType: string
}
